import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { ErrorCode, type SessionDto } from '@cat-gpt/shared';
import { REFRESH_REUSE_GRACE_MS } from '../../common/constants.js';
import { AppException } from '../../common/exceptions/app.exception.js';
import type { RequestMeta } from '../../common/utils/request-meta.js';
import { AppConfigService } from '../../config/app-config.service.js';
import {
  buildRefreshToken,
  generateSecret,
  hashEquals,
  hashSecret,
  parseRefreshToken,
} from './refresh-token.js';
import { Session } from './schemas/session.schema.js';

export interface IssuedSession {
  session: Session;
  refreshToken: string;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    private readonly config: AppConfigService,
  ) {}

  private nextExpiry(): Date {
    return new Date(Date.now() + this.config.auth.refreshTtlDays * 24 * 60 * 60 * 1000);
  }

  /** Tạo phiên mới khi đăng nhập. */
  async create(userId: string, meta: RequestMeta): Promise<IssuedSession> {
    const secret = generateSecret();
    const now = new Date();
    const session = await this.sessionModel.create({
      userId: new Types.ObjectId(userId),
      tokenHash: hashSecret(secret),
      userAgent: meta.userAgent,
      ip: meta.ip,
      lastUsedAt: now,
      expiresAt: this.nextExpiry(),
    });
    return {
      session: session.toObject(),
      refreshToken: buildRefreshToken(session._id.toString(), secret),
    };
  }

  /**
   * Xoay vòng refresh token: cấp secret mới, secret cũ hết hiệu lực.
   * Hạn phiên được gia hạn thêm REFRESH_TOKEN_TTL_DAYS kể từ lần dùng gần nhất (sliding expiration).
   *
   * Nếu phát hiện token cũ bị dùng lại sau thời gian ân hạn → coi như token bị đánh cắp,
   * thu hồi luôn phiên.
   */
  async rotate(refreshToken: string, meta: RequestMeta): Promise<IssuedSession> {
    const parsed = parseRefreshToken(refreshToken);
    if (!parsed) throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);

    const session = await this.sessionModel.findById(parsed.sessionId).lean<Session>().exec();
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);
    }

    const presentedHash = hashSecret(parsed.secret);
    const matchesCurrent = hashEquals(presentedHash, session.tokenHash);
    const matchesPreviousInGrace =
      !matchesCurrent &&
      session.previousTokenHash !== null &&
      session.rotatedAt !== null &&
      hashEquals(presentedHash, session.previousTokenHash) &&
      Date.now() - session.rotatedAt.getTime() <= REFRESH_REUSE_GRACE_MS;

    if (!matchesCurrent && !matchesPreviousInGrace) {
      this.logger.warn(`Phát hiện refresh token bị dùng lại, thu hồi phiên ${parsed.sessionId}`);
      await this.revoke(parsed.sessionId);
      throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);
    }

    const secret = generateSecret();
    const now = new Date();
    const updated = await this.sessionModel
      .findOneAndUpdate(
        { _id: session._id, revokedAt: null },
        {
          $set: {
            tokenHash: hashSecret(secret),
            previousTokenHash: session.tokenHash,
            rotatedAt: now,
            lastUsedAt: now,
            expiresAt: this.nextExpiry(),
            ip: meta.ip,
            userAgent: meta.userAgent,
          },
        },
        { returnDocument: 'after' },
      )
      .lean<Session>()
      .exec();

    if (!updated) throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);
    return { session: updated, refreshToken: buildRefreshToken(updated._id.toString(), secret) };
  }

  /** Trả về phiên nếu còn hiệu lực — dùng khi xác thực mỗi request. */
  async findActive(sessionId: string): Promise<Session | null> {
    if (!isValidObjectId(sessionId)) return null;
    return this.sessionModel
      .findOne({ _id: sessionId, revokedAt: null, expiresAt: { $gt: new Date() } })
      .lean<Session>()
      .exec();
  }

  async listActiveForUser(userId: string, currentSessionId: string): Promise<SessionDto[]> {
    const sessions = await this.sessionModel
      .find({ userId: new Types.ObjectId(userId), revokedAt: null, expiresAt: { $gt: new Date() } })
      .sort({ lastUsedAt: -1 })
      .lean<Session[]>()
      .exec();

    return sessions.map((s) => ({
      id: s._id.toString(),
      userAgent: s.userAgent,
      ip: s.ip,
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastUsedAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      isCurrent: s._id.toString() === currentSessionId,
    }));
  }

  async revoke(sessionId: string): Promise<void> {
    if (!isValidObjectId(sessionId)) return;
    await this.sessionModel
      .updateOne({ _id: sessionId, revokedAt: null }, { $set: { revokedAt: new Date() } })
      .exec();
  }

  /** Thu hồi một phiên của chính user (không cho thu hồi phiên hiện tại — dùng logout). */
  async revokeOwn(userId: string, sessionId: string, currentSessionId: string): Promise<void> {
    if (sessionId === currentSessionId) {
      throw AppException.badRequest(ErrorCode.SESSION_CANNOT_REVOKE_CURRENT);
    }
    if (!isValidObjectId(sessionId)) throw AppException.notFound(ErrorCode.SESSION_NOT_FOUND);

    const result = await this.sessionModel
      .updateOne(
        { _id: sessionId, userId: new Types.ObjectId(userId), revokedAt: null },
        { $set: { revokedAt: new Date() } },
      )
      .exec();
    if (result.matchedCount === 0) throw AppException.notFound(ErrorCode.SESSION_NOT_FOUND);
  }

  /** Thu hồi mọi phiên của user, có thể chừa lại một phiên (phiên hiện tại). */
  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<number> {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      revokedAt: null,
    };
    if (exceptSessionId) filter._id = { $ne: new Types.ObjectId(exceptSessionId) };

    const result = await this.sessionModel
      .updateMany(filter, { $set: { revokedAt: new Date() } })
      .exec();
    return result.modifiedCount;
  }
}

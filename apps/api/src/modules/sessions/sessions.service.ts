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

/** Số lần thử xoay token khi thua CAS (thường chỉ cần một lần thử lại). */
const MAX_ROTATE_ATTEMPTS = 3;

/** Số hash đã thay được giữ lại trong lịch sử phiên (SE-B3). */
const HISTORY_MAX = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Token đã trình thuộc loại nào (SE-B3, bảng timeline đã duyệt). */
export type PresentedKind =
  | 'current' // hash hiện tại
  | 'grace' // hash vừa bị thay, còn trong ân hạn 30 s
  | 'history' // đã từng hợp lệ (lịch sử ≤ tuổi tối đa), ngoài ân hạn
  | 'unknown'; // không khớp hash nào server biết

/** Phân loại dùng chung cho xoay và đăng xuất — không nhân bản logic. */
function classifyPresented(
  session: Session,
  presentedHash: string,
  now: number,
  historyMaxAgeMs: number,
): PresentedKind {
  if (hashEquals(presentedHash, session.tokenHash)) return 'current';
  if (
    session.previousTokenHash !== null &&
    session.rotatedAt !== null &&
    hashEquals(presentedHash, session.previousTokenHash) &&
    now - session.rotatedAt.getTime() <= REFRESH_REUSE_GRACE_MS
  ) {
    return 'grace';
  }
  const inHistory = (session.history ?? []).some(
    (entry) => now - entry.rotatedAt.getTime() <= historyMaxAgeMs && hashEquals(presentedHash, entry.hash),
  );
  return inHistory ? 'history' : 'unknown';
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
    const presentedHash = hashSecret(parsed.secret);

    let session = await this.findRotatable(parsed.sessionId);
    const first = this.classify(session, presentedHash);
    if (first === 'history') {
      // Token đã từng hợp lệ nhưng ngoài ân hạn: dấu hiệu dùng lại → thu hồi (như trước).
      this.logger.warn(`Phát hiện refresh token bị dùng lại, thu hồi phiên ${parsed.sessionId}`);
      await this.revoke(parsed.sessionId);
      throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);
    }
    if (first === 'unknown') {
      // Secret lạ: 401 nhưng KHÔNG thu hồi (không ai biết sessionId có thể vô hiệu hóa phiên).
      this.logger.warn(`Refresh token không khớp, giữ nguyên phiên ${parsed.sessionId}`);
      throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);
    }

    // Xoay có điều kiện (CAS trên tokenHash): hai request đồng thời cùng một token thì chỉ một
    // bên thắng. Bên thua đọc lại và xét lại theo ân hạn, KHÔNG thu hồi phiên (lỗi đua).
    for (let attempt = 1; ; attempt++) {
      const secret = generateSecret();
      const updated = await this.swapToken(session, secret, meta);
      if (updated) return { session: updated, refreshToken: buildRefreshToken(updated._id.toString(), secret) };
      if (attempt >= MAX_ROTATE_ATTEMPTS) throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);

      session = await this.findRotatable(parsed.sessionId);
      const kind = this.classify(session, presentedHash);
      if (kind === 'history' || kind === 'unknown') {
        // Thua CAS rồi thấy token không còn là current/grace: 401, không thu hồi (lỗi đua).
        throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);
      }
    }
  }

  /**
   * Đăng xuất: thu hồi phiên khi secret đã biết (current, grace hoặc lịch sử ≤ tuổi tối đa).
   * Secret lạ → không thu hồi (controller vẫn xóa cookie và trả 204).
   */
  async revokeWithSecret(refreshToken: string): Promise<void> {
    const parsed = parseRefreshToken(refreshToken);
    if (!parsed) return;
    const session = await this.sessionModel.findById(parsed.sessionId).lean<Session>().exec();
    if (!session || session.revokedAt) return;
    if (this.classify(session, hashSecret(parsed.secret)) === 'unknown') {
      this.logger.warn(`Đăng xuất với refresh token không khớp, giữ nguyên phiên ${parsed.sessionId}`);
      return;
    }
    await this.revoke(parsed.sessionId);
  }

  private classify(session: Session, presentedHash: string): PresentedKind {
    return classifyPresented(session, presentedHash, Date.now(), this.config.auth.refreshTtlDays * DAY_MS);
  }

  /** Phiên còn dùng được để xoay token; không thì 401 (không thu hồi). */
  private async findRotatable(sessionId: string): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId).lean<Session>().exec();
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);
    }
    return session;
  }

  /** Đổi sang tokenHash mới chỉ khi tokenHash trong DB vẫn bằng bản đã đọc (CAS). */
  private swapToken(session: Session, secret: string, meta: RequestMeta): Promise<Session | null> {
    const now = new Date();
    return this.sessionModel
      .findOneAndUpdate(
        { _id: session._id, revokedAt: null, tokenHash: session.tokenHash },
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
          // Cùng lệnh CAS: hash đang bị thay vào lịch sử, giữ tối đa HISTORY_MAX mục.
          $push: { history: { $each: [{ hash: session.tokenHash, rotatedAt: now }], $slice: -HISTORY_MAX } },
        },
        { returnDocument: 'after' },
      )
      .lean<Session>()
      .exec();
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

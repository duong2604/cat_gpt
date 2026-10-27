import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ErrorCode, UserStatus } from '@cat-gpt/shared';
import { ACCESS_TOKEN_COOKIE } from '../../common/constants.js';
import { AppException } from '../../common/exceptions/app.exception.js';
import type { AccessTokenPayload, AuthUser } from '../../common/types/auth-user.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { UsersService } from '../users/users.service.js';

const fromCookie = (req: Request): string | null =>
  (req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined) ?? null;

/**
 * Xác thực access token, lấy từ cookie (trình duyệt) hoặc header Bearer (Postman/Swagger).
 *
 * Sau khi kiểm tra chữ ký, strategy còn kiểm tra trong DB:
 * - phiên chưa bị thu hồi / hết hạn,
 * - tài khoản chưa bị khóa.
 * Nhờ đó khi admin khóa user hoặc user đăng xuất từ xa, request kế tiếp bị từ chối ngay,
 * không phải chờ access token hết hạn.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: AppConfigService,
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.auth.accessSecret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthUser> {
    const [session, user] = await Promise.all([
      this.sessions.findActive(payload.sid),
      this.users.findById(payload.sub),
    ]);

    // Kiểm tra khóa trước để client biết đúng lý do bị đăng xuất.
    if (user?.status === UserStatus.BLOCKED) {
      throw AppException.unauthorized(ErrorCode.AUTH_ACCOUNT_BLOCKED);
    }
    if (!session || !user || session.userId.toString() !== payload.sub) {
      throw AppException.unauthorized(ErrorCode.AUTH_SESSION_EXPIRED);
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
      email: user.email,
      role: user.role,
    };
  }
}

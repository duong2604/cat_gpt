import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode, UserStatus } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import type { AccessTokenPayload } from '../../common/types/auth-user.js';
import { DUMMY_PASSWORD_HASH, verifyPassword } from '../../common/utils/password-hash.js';
import type { RequestMeta } from '../../common/utils/request-meta.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { parseRefreshToken } from '../sessions/refresh-token.js';
import type { User } from '../users/schemas/user.schema.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto, meta: RequestMeta): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.users.findByEmailWithPassword(dto.email);

    // Luôn chạy bcrypt (kể cả khi không có user) để thời gian phản hồi như nhau.
    const passwordOk = await verifyPassword(dto.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!user || !passwordOk) {
      throw AppException.unauthorized(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
    // Chỉ báo "bị khóa" khi mật khẩu đúng, tránh lộ trạng thái tài khoản cho người lạ.
    if (user.status === UserStatus.BLOCKED) {
      throw AppException.forbidden(ErrorCode.AUTH_ACCOUNT_BLOCKED);
    }

    const userId = user._id.toString();
    const { session, refreshToken } = await this.sessions.create(userId, meta);
    await this.users.touchLastLogin(userId);

    const freshUser = await this.users.getByIdOrThrow(userId);
    return {
      user: freshUser,
      tokens: {
        accessToken: await this.signAccessToken(userId, session._id.toString()),
        refreshToken,
      },
    };
  }

  async refresh(refreshToken: string | undefined, meta: RequestMeta): Promise<AuthTokens> {
    if (!refreshToken) throw AppException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID);

    const { session, refreshToken: nextRefreshToken } = await this.sessions.rotate(
      refreshToken,
      meta,
    );
    const userId = session.userId.toString();

    const user = await this.users.findById(userId);
    if (!user || user.status === UserStatus.BLOCKED) {
      await this.sessions.revoke(session._id.toString());
      throw AppException.unauthorized(
        user ? ErrorCode.AUTH_ACCOUNT_BLOCKED : ErrorCode.AUTH_REFRESH_INVALID,
      );
    }

    return {
      accessToken: await this.signAccessToken(userId, session._id.toString()),
      refreshToken: nextRefreshToken,
    };
  }

  /** Đăng xuất phiên hiện tại. Không ném lỗi nếu token không hợp lệ — vẫn xóa cookie. */
  async logout(refreshToken: string | undefined): Promise<void> {
    const parsed = refreshToken ? parseRefreshToken(refreshToken) : null;
    if (parsed) await this.sessions.revoke(parsed.sessionId);
  }

  private signAccessToken(userId: string, sessionId: string): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId, sid: sessionId };
    return this.jwt.signAsync(payload);
  }
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCode } from '@cat-gpt/shared';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AppException } from '../exceptions/app.exception.js';

/** Guard toàn cục: mọi endpoint yêu cầu access token hợp lệ, trừ endpoint gắn @Public(). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  override handleRequest<TUser>(err: unknown, user: TUser, info: unknown): TUser {
    if (err) throw err;
    if (!user) {
      const expired = info instanceof Error && info.name === 'TokenExpiredError';
      throw AppException.unauthorized(
        expired ? ErrorCode.AUTH_SESSION_EXPIRED : ErrorCode.AUTH_UNAUTHENTICATED,
      );
    }
    return user;
  }
}

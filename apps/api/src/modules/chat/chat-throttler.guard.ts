import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerException, type ThrottlerStorage } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AuthUser } from '../../common/types/auth-user.js';

const TTL_MS = 60_000;
const LIMIT_PER_USER = 20;

/**
 * Giới hạn 20 lần/phút theo người dùng (không theo IP) cho 2 endpoint SSE của chat
 * (Basic Design 4.6). Áp bằng `@UseGuards()` ở method, không phải `APP_GUARD`, nên chạy
 * sau `JwtAuthGuard` và `req.user` đã có — tách biệt khỏi bucket IP 120 req/phút chung.
 */
@Injectable()
export class ChatThrottlerGuard implements CanActivate {
  constructor(@InjectThrottlerStorage() private readonly storage: ThrottlerStorage) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as AuthUser;
    const key = `chat-user:${user.userId}`;
    const { isBlocked } = await this.storage.increment(key, TTL_MS, LIMIT_PER_USER, TTL_MS, 'chat-user');
    if (isBlocked) throw new ThrottlerException();
    return true;
  }
}

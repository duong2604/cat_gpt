import type { UserRole } from '@cat-gpt/shared';

/** Thông tin người dùng gắn vào request sau khi xác thực access token. */
export interface AuthUser {
  userId: string;
  sessionId: string;
  email: string;
  role: UserRole;
}

/** Payload bên trong access token (JWT). */
export interface AccessTokenPayload {
  sub: string;
  sid: string;
}

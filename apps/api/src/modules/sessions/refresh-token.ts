import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { isValidObjectId } from 'mongoose';

/**
 * Refresh token có dạng `<sessionId>.<secret>`:
 * - sessionId để tìm phiên nhanh (không cần quét theo hash).
 * - secret ngẫu nhiên 256 bit; DB chỉ lưu SHA-256 của secret.
 *
 * Dùng SHA-256 (không phải bcrypt) vì secret đã có entropy cao, không thể brute-force.
 */
export function generateSecret(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function buildRefreshToken(sessionId: string, secret: string): string {
  return `${sessionId}.${secret}`;
}

export function parseRefreshToken(token: string): { sessionId: string; secret: string } | null {
  const [sessionId, secret, ...rest] = token.split('.');
  if (rest.length > 0 || !sessionId || !secret || !isValidObjectId(sessionId)) return null;
  return { sessionId, secret };
}

export function hashEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

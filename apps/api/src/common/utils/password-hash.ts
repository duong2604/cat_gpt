import bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../constants.js';

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Hash giả dùng khi email không tồn tại, để thời gian phản hồi đăng nhập
 * không tiết lộ email nào có trong hệ thống (chống dò tài khoản qua timing).
 */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);

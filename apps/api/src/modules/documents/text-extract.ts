/** Giải mã TXT: UTF-8 hợp lệ, bỏ BOM. Ném lỗi nếu không giải mã được. */
export function extractTxt(buffer: Buffer): string {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return decoder.decode(buffer).replace(/^﻿/, '');
}

/**
 * Kiểm chữ ký TXT (thiết kế mục 5): UTF-8 hợp lệ và không chứa byte 0x00.
 * `TextDecoder` tự nó chấp nhận 0x00 (NUL là một ký tự UTF-8 hợp lệ) nên phải kiểm riêng.
 */
export function isValidTxtSignature(buffer: Buffer): boolean {
  if (buffer.includes(0x00)) return false;
  try {
    extractTxt(buffer);
    return true;
  } catch {
    return false;
  }
}

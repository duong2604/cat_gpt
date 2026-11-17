import { describe, expect, it } from 'vitest';
import { extractTxt, isValidTxtSignature } from './text-extract.js';

describe('text-extract', () => {
  it('giải mã UTF-8 hợp lệ và bỏ BOM', () => {
    const withBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('xin chào', 'utf-8')]);
    expect(extractTxt(withBom)).toBe('xin chào');
  });

  it('chấp nhận tệp TXT UTF-8 hợp lệ', () => {
    expect(isValidTxtSignature(Buffer.from('nội dung tiếng Việt', 'utf-8'))).toBe(true);
  });

  it('từ chối byte không phải UTF-8 hợp lệ', () => {
    expect(isValidTxtSignature(Buffer.from([0xff, 0xfe, 0x00, 0x01]))).toBe(false);
  });

  it('từ chối tệp chứa byte 0x00 dù phần còn lại là UTF-8 hợp lệ', () => {
    const buf = Buffer.concat([Buffer.from('abc'), Buffer.from([0x00]), Buffer.from('def')]);
    expect(isValidTxtSignature(buf)).toBe(false);
  });
});

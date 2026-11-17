import { describe, expect, it } from 'vitest';
import { fixMulterFilenameEncoding, sanitizeFileName } from './sanitize-filename.js';

describe('sanitizeFileName', () => {
  it('giữ nguyên tên hợp lệ', () => {
    expect(sanitizeFileName('báo cáo.txt')).toBe('báo cáo.txt');
  });

  it('bỏ dấu phân cách đường dẫn', () => {
    expect(sanitizeFileName('../../etc/passwd.txt')).toBe('.._.._etc_passwd.txt');
  });

  it('bỏ ký tự điều khiển', () => {
    expect(sanitizeFileName('a\u0000b\u001fc.txt')).toBe('abc.txt');
  });

  it('dùng tên mặc định khi rỗng sau khi làm sạch', () => {
    expect(sanitizeFileName('\u0000\u0000')).toBe('document.txt');
  });

  it('giới hạn 255 ký tự', () => {
    const longName = `${'a'.repeat(300)}.txt`;
    expect(sanitizeFileName(longName).length).toBe(255);
  });
});

describe('fixMulterFilenameEncoding', () => {
  it('khôi phục tên tiếng Việt bị multer giải mã sai thành latin1', () => {
    const original = 'Giới thiệu Việt Nam.txt';
    const mojibake = Buffer.from(original, 'utf8').toString('latin1');
    expect(fixMulterFilenameEncoding(mojibake)).toBe(original);
  });

  it('không ảnh hưởng tên thuần ASCII', () => {
    expect(fixMulterFilenameEncoding('report-2026.txt')).toBe('report-2026.txt');
  });
});

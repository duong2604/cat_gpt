// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

/**
 * multer/busboy giải mã tên tệp multipart bằng latin1 thay vì UTF-8, làm tên tiếng Việt
 * (vd "Giới thiệu.txt") biến thành chuỗi lỗi (vd "Giá»i thiá»u.txt"). Bù lại bằng cách
 * đọc ngược các ký tự đó như byte latin1 rồi giải mã UTF-8 — khôi phục đúng byte gốc vì
 * latin1 ánh xạ 1:1 byte↔code point. Tên thuần ASCII không bị ảnh hưởng (round-trip y nguyên).
 */
export function fixMulterFilenameEncoding(originalName: string): string {
  return Buffer.from(originalName, 'latin1').toString('utf8');
}

/** Chuẩn hóa Unicode NFC, bỏ ký tự điều khiển và dấu phân cách đường dẫn, giới hạn 255 ký tự. */
export function sanitizeFileName(original: string): string {
  const cleaned = original
    .normalize('NFC')
    .replace(/[/\\]/g, '_')
    .replace(CONTROL_CHARS, '')
    .trim();
  const name = cleaned || 'document.txt';
  return name.length > 255 ? name.slice(0, 255) : name;
}

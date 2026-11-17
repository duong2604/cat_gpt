// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

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

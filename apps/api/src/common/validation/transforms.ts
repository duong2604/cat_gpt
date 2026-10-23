import { Transform } from 'class-transformer';

/** Cắt khoảng trắng hai đầu cho chuỗi. */
export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/** Cắt khoảng trắng và chuyển về chữ thường (dùng cho email). */
export const TrimLower = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

/** Chuỗi rỗng sau khi trim được coi là null (dùng để xóa giá trị trường không bắt buộc). */
export const EmptyToNull = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });

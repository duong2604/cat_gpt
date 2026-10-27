export interface SaveFileInput {
  /** Thư mục logic, ví dụ "avatars". */
  folder: string;
  buffer: Buffer;
  extension: string;
  contentType: string;
}

/**
 * Hợp đồng lưu trữ file. Code nghiệp vụ chỉ phụ thuộc lớp trừu tượng này.
 *
 * - Hiện tại: LocalStorageProvider (lưu trên ổ đĩa của server API).
 * - Module 3: thay bằng MinioStorageProvider, không phải sửa code nghiệp vụ.
 *
 * Dùng abstract class (thay vì interface) để làm DI token trực tiếp.
 */
export abstract class StorageService {
  /** Lưu file và trả về key (đường dẫn tương đối) để lưu vào DB. */
  abstract save(input: SaveFileInput): Promise<string>;

  /** Xóa file theo key. Không ném lỗi nếu file không tồn tại. */
  abstract delete(key: string): Promise<void>;

  /** URL để client truy cập file. */
  abstract getPublicUrl(key: string): string;
}

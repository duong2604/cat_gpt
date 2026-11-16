import type { ErrorCode } from './error-codes.js';
import type { UserRole, UserStatus } from './enums.js';

/** Thông tin người dùng trả về cho client (không bao giờ có passwordHash). */
export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  department: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Tính năng bật/tắt theo cấu hình máy chủ hiện tại (không suy ra từ môi trường phía client). */
export interface AppFeaturesDto {
  /** `false` ở bản `staff` khi LLM còn là bản mẫu (CS-6). */
  chatEnabled: boolean;
}

/** Thông tin người dùng trả về cho màn quản trị. Không có avatarUrl (CS-4: ảnh chỉ chính chủ xem). */
export type AdminUserDto = Omit<UserDto, 'avatarUrl'>;

export interface SessionDto {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Định dạng lỗi thống nhất của API. */
export interface ApiErrorBody {
  statusCode: number;
  code: ErrorCode;
  message: string;
  /** Lỗi theo từng trường khi code = VALIDATION_FAILED. */
  details?: Record<string, string[]>;
  path: string;
  timestamp: string;
}

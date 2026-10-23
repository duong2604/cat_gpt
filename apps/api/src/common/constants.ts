export const API_PREFIX = 'api/v1';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Cookie refresh chỉ được gửi tới các endpoint dưới đường dẫn này (refresh, logout). */
export const REFRESH_COOKIE_PATH = `/${API_PREFIX}/auth`;

/** Đường dẫn public phục vụ file từ LocalStorageProvider. */
export const LOCAL_FILES_ROUTE = `/${API_PREFIX}/files`;

export const BCRYPT_ROUNDS = 10;

/** Thời gian cho phép dùng lại refresh token vừa bị xoay vòng (xử lý nhiều tab refresh cùng lúc). */
export const REFRESH_REUSE_GRACE_MS = 30_000;

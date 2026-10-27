import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { type ApiErrorBody, ErrorCode } from "@cat-gpt/shared";

/**
 * Axios instance dùng chung cho toàn bộ app.
 * - baseURL tương đối: Next.js rewrites chuyển /api/* sang NestJS → cùng origin, cookie httpOnly tự gửi kèm.
 * - Interceptor: access token hết hạn → tự gọi /auth/refresh rồi gửi lại request.
 */
export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Các mã 401 có thể cứu được bằng cách refresh token. */
const REFRESHABLE_CODES: ReadonlySet<string> = new Set([
  ErrorCode.AUTH_UNAUTHENTICATED,
  ErrorCode.AUTH_SESSION_EXPIRED,
]);

/** Không refresh cho chính các endpoint xác thực (tránh vòng lặp). */
const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/logout"];

export type AuthFailureReason = "expired" | "blocked";

let onAuthFailure: (reason: AuthFailureReason) => void = () => {};

/** Đăng ký hành động khi phiên không thể khôi phục (ví dụ chuyển về trang đăng nhập). */
export function setAuthFailureHandler(handler: (reason: AuthFailureReason) => void): void {
  onAuthFailure = handler;
}

/**
 * Chỉ có một request refresh tại một thời điểm.
 * Nhiều request cùng gặp 401 sẽ chờ chung promise này rồi thử lại.
 */
let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  refreshPromise ??= api
    .post("/auth/refresh")
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

/**
 * Dùng cho request không đi qua axios (fetch streaming) khi gặp 401.
 * Trả về true nếu đã refresh thành công và nên gửi lại request.
 */
export async function recoverFromUnauthorized(code: string | undefined): Promise<boolean> {
  if (code === ErrorCode.AUTH_ACCOUNT_BLOCKED) {
    onAuthFailure("blocked");
    return false;
  }
  if (!code || !REFRESHABLE_CODES.has(code)) {
    onAuthFailure("expired");
    return false;
  }
  try {
    await refreshSession();
    return true;
  } catch (refreshError) {
    const refreshCode = refreshError instanceof AxiosError ? errorCodeOf(refreshError) : undefined;
    onAuthFailure(refreshCode === ErrorCode.AUTH_ACCOUNT_BLOCKED ? "blocked" : "expired");
    return false;
  }
}

function errorCodeOf(error: AxiosError): string | undefined {
  return (error.response?.data as Partial<ApiErrorBody> | undefined)?.code;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const code = errorCodeOf(error);
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.startsWith(path));

    if (!config || status !== 401 || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (code === ErrorCode.AUTH_ACCOUNT_BLOCKED) {
      onAuthFailure("blocked");
      return Promise.reject(error);
    }

    if (!config._retried && code && REFRESHABLE_CODES.has(code)) {
      config._retried = true;
      try {
        await refreshSession();
        return api(config);
      } catch (refreshError) {
        const refreshCode =
          refreshError instanceof AxiosError ? errorCodeOf(refreshError) : undefined;
        onAuthFailure(refreshCode === ErrorCode.AUTH_ACCOUNT_BLOCKED ? "blocked" : "expired");
        return Promise.reject(error);
      }
    }

    onAuthFailure("expired");
    return Promise.reject(error);
  },
);

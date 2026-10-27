import { isAxiosError } from "axios";
import { type ApiErrorBody, ErrorCode } from "@cat-gpt/shared";

/** Mã lỗi phía client, bổ sung cho ErrorCode của API. */
export const NETWORK_ERROR = "NETWORK_ERROR";

export type AppErrorCode = ErrorCode | typeof NETWORK_ERROR;

/** Rút mã lỗi chuẩn hóa từ mọi loại lỗi (axios, lỗi mạng, lỗi JS). */
export function getErrorCode(error: unknown): AppErrorCode {
  if (isAxiosError(error)) {
    if (!error.response) return NETWORK_ERROR;
    const code = (error.response.data as Partial<ApiErrorBody> | undefined)?.code;
    if (code && code in ErrorCode) return code;
  }
  return ErrorCode.INTERNAL_ERROR;
}

/** Lỗi validate theo từng trường mà API trả về (VALIDATION_FAILED). */
export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (isAxiosError(error)) {
    return (error.response?.data as Partial<ApiErrorBody> | undefined)?.details ?? {};
  }
  return {};
}

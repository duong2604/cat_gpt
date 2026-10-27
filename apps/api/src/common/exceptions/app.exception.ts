import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@cat-gpt/shared';

/**
 * Exception nghiệp vụ mang theo mã lỗi chuẩn hóa.
 * `message` chỉ phục vụ debug/log; FE hiển thị theo `code`.
 */
export class AppException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    status: HttpStatus,
    message: string = code,
    readonly details?: Record<string, string[]>,
  ) {
    super({ code, message, details }, status);
  }

  static badRequest(code: ErrorCode, message?: string) {
    return new AppException(code, HttpStatus.BAD_REQUEST, message);
  }

  static unauthorized(code: ErrorCode = ErrorCode.AUTH_UNAUTHENTICATED, message?: string) {
    return new AppException(code, HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(code: ErrorCode = ErrorCode.FORBIDDEN, message?: string) {
    return new AppException(code, HttpStatus.FORBIDDEN, message);
  }

  static notFound(code: ErrorCode = ErrorCode.NOT_FOUND, message?: string) {
    return new AppException(code, HttpStatus.NOT_FOUND, message);
  }

  static conflict(code: ErrorCode, message?: string) {
    return new AppException(code, HttpStatus.CONFLICT, message);
  }
}

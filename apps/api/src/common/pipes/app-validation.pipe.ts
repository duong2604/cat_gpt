import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { ErrorCode } from '@cat-gpt/shared';
import { AppException } from '../exceptions/app.exception.js';

/** Gom lỗi validate (kể cả lồng nhau) thành { "field.sub": ["constraint", ...] }. */
function flatten(errors: ValidationError[], parent = ''): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const error of errors) {
    const key = parent ? `${parent}.${error.property}` : error.property;
    if (error.constraints) {
      result[key] = Object.keys(error.constraints);
    }
    if (error.children?.length) {
      Object.assign(result, flatten(error.children, key));
    }
  }
  return result;
}

/**
 * ValidationPipe dùng chung:
 * - whitelist + forbidNonWhitelisted: chặn trường lạ gửi lên.
 * - transform: chuyển query string sang đúng kiểu DTO.
 * - Lỗi trả về dạng VALIDATION_FAILED, `details` chứa tên constraint (isEmail, minLength…) để FE tự dịch.
 */
export const appValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) =>
    new AppException(
      ErrorCode.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      'Validation failed',
      flatten(errors),
    ),
});

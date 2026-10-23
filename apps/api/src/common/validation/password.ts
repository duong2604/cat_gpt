import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from '@cat-gpt/shared';

/** Chính sách mật khẩu dùng chung: 8–64 ký tự, có cả chữ và số. */
export function IsStrongPassword() {
  return applyDecorators(
    ApiProperty({
      minLength: PASSWORD_MIN_LENGTH,
      maxLength: PASSWORD_MAX_LENGTH,
      example: 'Passw0rd',
      description: 'Tối thiểu 8 ký tự, có ít nhất một chữ cái và một chữ số',
    }),
    IsString(),
    MinLength(PASSWORD_MIN_LENGTH),
    MaxLength(PASSWORD_MAX_LENGTH),
    Matches(PASSWORD_PATTERN, { message: 'passwordPattern' }),
  );
}

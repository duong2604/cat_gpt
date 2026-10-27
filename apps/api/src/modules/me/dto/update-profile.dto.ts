import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { PHONE_PATTERN } from '@cat-gpt/shared';
import { EmptyToNull, Trim } from '../../../common/validation/transforms.js';

/** Người dùng tự cập nhật hồ sơ. Email và vai trò chỉ admin được đổi. */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '0912345678' })
  @IsOptional()
  @EmptyToNull()
  @ValidateIf((_, v) => v !== null)
  @Matches(PHONE_PATTERN)
  phone?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Phòng Kỹ thuật' })
  @IsOptional()
  @EmptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(100)
  department?: string | null;
}

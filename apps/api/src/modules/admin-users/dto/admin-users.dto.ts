import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PHONE_PATTERN, UserRole, UserStatus } from '@cat-gpt/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { IsStrongPassword } from '../../../common/validation/password.js';
import { EmptyToNull, Trim, TrimLower } from '../../../common/validation/transforms.js';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo email, họ tên, phòng ban' })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: Object.values(UserRole) })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: Object.values(UserStatus) })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class CreateUserDto {
  @ApiProperty({ example: 'nhanvien@catgpt.local' })
  @TrimLower()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsStrongPassword()
  password: string;

  @ApiProperty({ enum: Object.values(UserRole), default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole = UserRole.USER;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @EmptyToNull()
  @ValidateIf((_, v) => v !== null)
  @Matches(PHONE_PATTERN)
  phone?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @EmptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(100)
  department?: string | null;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @TrimLower()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ enum: Object.values(UserRole) })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @EmptyToNull()
  @ValidateIf((_, v) => v !== null)
  @Matches(PHONE_PATTERN)
  phone?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @EmptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(100)
  department?: string | null;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: Object.values(UserStatus) })
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class ResetPasswordDto {
  @IsStrongPassword()
  newPassword: string;
}

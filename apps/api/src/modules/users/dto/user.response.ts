import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  type PaginationMeta,
  type SessionDto,
  type UserDto,
  UserRole,
  UserStatus,
} from '@cat-gpt/shared';

/** Các lớp mô tả response cho Swagger (dữ liệu thực tế là UserDto/SessionDto từ shared). */
export class UserResponse implements UserDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() fullName: string;
  @ApiPropertyOptional({ type: String, nullable: true }) phone: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) department: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) avatarUrl: string | null;
  @ApiProperty({ enum: Object.values(UserRole) }) role: UserRole;
  @ApiProperty({ enum: Object.values(UserStatus) }) status: UserStatus;
  @ApiPropertyOptional({ type: String, nullable: true }) lastLoginAt: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class PaginationMetaResponse implements PaginationMeta {
  @ApiProperty() page: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() total: number;
  @ApiProperty() totalPages: number;
}

export class PaginatedUsersResponse {
  @ApiProperty({ type: [UserResponse] }) items: UserResponse[];
  @ApiProperty({ type: PaginationMetaResponse }) meta: PaginationMetaResponse;
}

export class SessionResponse implements SessionDto {
  @ApiProperty() id: string;
  @ApiPropertyOptional({ type: String, nullable: true }) userAgent: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) ip: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() lastUsedAt: string;
  @ApiProperty() expiresAt: string;
  @ApiProperty() isCurrent: boolean;
}

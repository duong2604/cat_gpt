import { Injectable } from '@nestjs/common';
import type { UserDto } from '@cat-gpt/shared';
import { StorageService } from '../storage/storage.service.js';
import type { User } from './schemas/user.schema.js';

/** Chuyển document User thành UserDto trả về client. */
@Injectable()
export class UserPresenter {
  constructor(private readonly storage: StorageService) {}

  toDto(user: User): UserDto {
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? null,
      department: user.department ?? null,
      avatarUrl: user.avatarKey ? this.storage.getPublicUrl(user.avatarKey) : null,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { AVATAR_MAX_SIZE_BYTES, ErrorCode, type UserDto } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { verifyPassword } from '../../common/utils/password-hash.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { detectImageType } from '../storage/image-signature.js';
import { StorageService } from '../storage/storage.service.js';
import { UserPresenter } from '../users/user.presenter.js';
import { UsersService } from '../users/users.service.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class MeService {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly storage: StorageService,
    private readonly presenter: UserPresenter,
  ) {}

  async getProfile(userId: string): Promise<UserDto> {
    return this.presenter.toDto(await this.users.getByIdOrThrow(userId));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserDto> {
    return this.presenter.toDto(await this.users.update(userId, dto));
  }

  /** Đổi mật khẩu và đăng xuất mọi thiết bị khác (giữ phiên hiện tại). */
  async changePassword(auth: AuthUser, dto: ChangePasswordDto): Promise<void> {
    const hash = await this.users.getPasswordHash(auth.userId);
    if (!(await verifyPassword(dto.currentPassword, hash))) {
      throw AppException.badRequest(ErrorCode.USER_WRONG_CURRENT_PASSWORD);
    }
    if (dto.currentPassword === dto.newPassword) {
      throw AppException.badRequest(ErrorCode.USER_SAME_PASSWORD);
    }
    await this.users.setPassword(auth.userId, dto.newPassword);
    await this.sessions.revokeAllForUser(auth.userId, auth.sessionId);
  }

  async updateAvatar(userId: string, file: Express.Multer.File | undefined): Promise<UserDto> {
    if (!file) throw AppException.badRequest(ErrorCode.FILE_REQUIRED);
    if (file.size > AVATAR_MAX_SIZE_BYTES) throw AppException.badRequest(ErrorCode.FILE_TOO_LARGE);

    const image = detectImageType(file.buffer);
    if (!image) throw AppException.badRequest(ErrorCode.FILE_INVALID_TYPE);

    const current = await this.users.getByIdOrThrow(userId);
    const avatarKey = await this.storage.save({
      folder: 'avatars',
      buffer: file.buffer,
      extension: image.extension,
      contentType: image.mime,
    });
    const updated = await this.users.update(userId, { avatarKey });

    if (current.avatarKey) await this.storage.delete(current.avatarKey);
    return this.presenter.toDto(updated);
  }

  async removeAvatar(userId: string): Promise<UserDto> {
    const current = await this.users.getByIdOrThrow(userId);
    const updated = await this.users.update(userId, { avatarKey: null });
    if (current.avatarKey) await this.storage.delete(current.avatarKey);
    return this.presenter.toDto(updated);
  }
}

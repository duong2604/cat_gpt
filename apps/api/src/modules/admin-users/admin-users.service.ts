import { Injectable } from '@nestjs/common';
import {
  ErrorCode,
  type Paginated,
  type UserDto,
  UserRole,
  UserStatus,
} from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { SessionsService } from '../sessions/sessions.service.js';
import type { User } from '../users/schemas/user.schema.js';
import { UserPresenter } from '../users/user.presenter.js';
import { UsersService } from '../users/users.service.js';
import type {
  CreateUserDto,
  ListUsersQueryDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto/admin-users.dto.js';

/**
 * Nghiệp vụ quản trị người dùng.
 * Quy tắc an toàn:
 * - Không có chức năng xóa người dùng (chỉ khóa).
 * - Admin không tự khóa / tự hạ quyền chính mình.
 * - Luôn còn ít nhất một admin đang hoạt động.
 * - Khóa tài khoản hoặc đặt lại mật khẩu → thu hồi toàn bộ phiên của người đó.
 */
@Injectable()
export class AdminUsersService {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly presenter: UserPresenter,
  ) {}

  async list(query: ListUsersQueryDto): Promise<Paginated<UserDto>> {
    const { items, total } = await this.users.list({
      search: query.search || undefined,
      role: query.role,
      status: query.status,
      skip: query.skip,
      limit: query.pageSize,
    });
    return { items: items.map((u) => this.presenter.toDto(u)), meta: query.toMeta(total) };
  }

  async get(id: string): Promise<UserDto> {
    return this.presenter.toDto(await this.users.getByIdOrThrow(id));
  }

  async create(admin: AuthUser, dto: CreateUserDto): Promise<UserDto> {
    const user = await this.users.create({ ...dto, createdBy: admin.userId });
    return this.presenter.toDto(user);
  }

  async update(admin: AuthUser, id: string, dto: UpdateUserDto): Promise<UserDto> {
    const target = await this.users.getByIdOrThrow(id);

    if (dto.role && dto.role !== target.role) {
      this.assertNotSelf(admin, id);
      if (target.role === UserRole.ADMIN) await this.assertNotLastActiveAdmin(target);
    }

    return this.presenter.toDto(await this.users.update(id, dto));
  }

  async setStatus(admin: AuthUser, id: string, status: UserStatus): Promise<UserDto> {
    const target = await this.users.getByIdOrThrow(id);
    if (target.status === status) return this.presenter.toDto(target);

    if (status === UserStatus.BLOCKED) {
      this.assertNotSelf(admin, id);
      if (target.role === UserRole.ADMIN) await this.assertNotLastActiveAdmin(target);
    }

    const updated = await this.users.update(id, { status });
    if (status === UserStatus.BLOCKED) await this.sessions.revokeAllForUser(id);
    return this.presenter.toDto(updated);
  }

  async resetPassword(id: string, dto: ResetPasswordDto): Promise<void> {
    await this.users.getByIdOrThrow(id);
    await this.users.setPassword(id, dto.newPassword);
    await this.sessions.revokeAllForUser(id);
  }

  private assertNotSelf(admin: AuthUser, targetId: string): void {
    if (admin.userId === targetId) {
      throw AppException.badRequest(ErrorCode.USER_CANNOT_MODIFY_SELF);
    }
  }

  private async assertNotLastActiveAdmin(target: User): Promise<void> {
    if (target.status !== UserStatus.ACTIVE) return;
    if ((await this.users.countActiveAdmins()) <= 1) {
      throw AppException.badRequest(ErrorCode.USER_LAST_ADMIN);
    }
  }
}

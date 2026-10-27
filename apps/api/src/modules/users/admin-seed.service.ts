import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UserRole } from '@cat-gpt/shared';
import { AppConfigService } from '../../config/app-config.service.js';
import { UsersService } from './users.service.js';

/**
 * Tạo tài khoản admin mặc định khi hệ thống chưa có admin nào.
 * Thông tin lấy từ ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_FULL_NAME.
 */
@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly users: UsersService,
    private readonly config: AppConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (await this.users.existsAnyAdmin()) return;

    const { email, password, fullName } = this.config.seedAdmin;
    await this.users.create({ email, password, fullName, role: UserRole.ADMIN });
    this.logger.log(`Đã tạo tài khoản admin mặc định: ${email}`);
  }
}

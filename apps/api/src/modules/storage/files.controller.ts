import { access } from 'node:fs/promises';
import { Controller, Get, NotFoundException, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { AuthUser } from '../../common/types/auth-user.js';
import { UsersService } from '../users/users.service.js';
import { LocalStorageProvider } from './local-storage.provider.js';

/**
 * Phục vụ ảnh đại diện. Yêu cầu đăng nhập (không @Public(), JwtAuthGuard toàn cục áp dụng).
 * Chỉ chính chủ xem được (CS-4): mọi trường hợp khác — người khác, admin, key sai, file không
 * tồn tại — đều trả 404 như nhau, không lộ việc file có tồn tại hay không.
 */
@Controller('files/avatars')
export class FilesController {
  constructor(
    private readonly storage: LocalStorageProvider,
    private readonly users: UsersService,
  ) {}

  @Get(':file')
  async getAvatar(
    @Param('file') file: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const authUser = req.user as AuthUser;
    const key = `avatars/${file}`;

    const owner = await this.users.findById(authUser.userId);
    if (!owner || owner.avatarKey !== key) {
      throw new NotFoundException();
    }

    let absolutePath: string;
    try {
      absolutePath = this.storage.getAbsolutePath(key);
      await access(absolutePath);
    } catch {
      throw new NotFoundException();
    }

    // no-store: ảnh đổi hoặc bị xóa phải hết hiển thị ngay, không được cache lại key cũ.
    res.set('Cache-Control', 'private, no-store');
    res.sendFile(absolutePath, { dotfiles: 'deny', cacheControl: false });
  }
}

import { access } from 'node:fs/promises';
import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LocalStorageProvider } from './local-storage.provider.js';

/** Phục vụ file đã lưu (ảnh đại diện). Yêu cầu đăng nhập: không gắn @Public(), nên JwtAuthGuard toàn cục áp dụng. */
@Controller('files')
export class FilesController {
  constructor(private readonly storage: LocalStorageProvider) {}

  @Get('*splat')
  async getFile(@Param('splat') splat: string[], @Res() res: Response): Promise<void> {
    const key = splat.join('/');
    let absolutePath: string;
    try {
      absolutePath = this.storage.getAbsolutePath(key);
      await access(absolutePath);
    } catch {
      throw new NotFoundException();
    }

    res.set('Cache-Control', 'private, max-age=3600');
    res.sendFile(absolutePath, { dotfiles: 'deny', cacheControl: false });
  }
}

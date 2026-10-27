import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { AppConfigService } from '../../config/app-config.service.js';
import { LOCAL_FILES_ROUTE } from '../../common/constants.js';
import { type SaveFileInput, StorageService } from './storage.service.js';

/** Lưu file vào thư mục UPLOAD_DIR, phục vụ qua route tĩnh LOCAL_FILES_ROUTE. */
@Injectable()
export class LocalStorageProvider extends StorageService {
  private readonly logger = new Logger(LocalStorageProvider.name);
  readonly rootDir: string;

  constructor(config: AppConfigService) {
    super();
    this.rootDir = resolve(config.uploadDir);
  }

  async save({ folder, buffer, extension }: SaveFileInput): Promise<string> {
    const key = `${folder}/${randomUUID()}.${extension}`;
    const fullPath = this.resolveKey(key);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.resolveKey(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Không xóa được file ${key}: ${(error as Error).message}`);
      }
    }
  }

  getPublicUrl(key: string): string {
    return `${LOCAL_FILES_ROUTE}/${key}`;
  }

  /** Chặn path traversal: key phải nằm trong rootDir. */
  private resolveKey(key: string): string {
    const fullPath = resolve(join(this.rootDir, key));
    if (!fullPath.startsWith(this.rootDir + sep)) {
      throw new Error(`Storage key không hợp lệ: ${key}`);
    }
    return fullPath;
  }
}

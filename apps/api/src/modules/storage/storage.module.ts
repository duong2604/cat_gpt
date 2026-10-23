import { Global, Module } from '@nestjs/common';
import { LocalStorageProvider } from './local-storage.provider.js';
import { StorageService } from './storage.service.js';

/**
 * TODO(module-3): thêm MinioStorageProvider và chọn provider theo biến môi trường
 * STORAGE_DRIVER=local|minio.
 */
@Global()
@Module({
  providers: [
    LocalStorageProvider,
    { provide: StorageService, useExisting: LocalStorageProvider },
  ],
  exports: [StorageService, LocalStorageProvider],
})
export class StorageModule {}

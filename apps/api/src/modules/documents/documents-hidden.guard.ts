import { CanActivate, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service.js';
import { ReleaseMode } from '../../config/env.validation.js';
import { AppException } from '../../common/exceptions/app.exception.js';

/** Bản `staff` ẩn Tài liệu — chưa sẵn sàng cho thử nội bộ (CS-6, SE-003). */
export function isDocumentsHidden(config: AppConfigService): boolean {
  return config.releaseMode === ReleaseMode.Staff;
}

/** Trả 404 như route không tồn tại khi Tài liệu bị ẩn, giống ChatHiddenGuard của SE-003. */
@Injectable()
export class DocumentsHiddenGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(): boolean {
    if (isDocumentsHidden(this.config)) throw AppException.notFound();
    return true;
  }
}

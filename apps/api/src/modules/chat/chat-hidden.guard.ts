import { CanActivate, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service.js';
import { ReleaseMode } from '../../config/env.validation.js';
import { AppException } from '../../common/exceptions/app.exception.js';
import { LlmProvider } from '../llm/llm.provider.js';

/**
 * Bản `staff` ẩn Chat khi còn dùng LLM mẫu (CS-6): trả 404 như route không tồn tại,
 * giống hành vi "không tìm thấy" dùng cho hội thoại của người khác.
 */
@Injectable()
export class ChatHiddenGuard implements CanActivate {
  constructor(
    private readonly config: AppConfigService,
    private readonly llm: LlmProvider,
  ) {}

  canActivate(): boolean {
    if (this.config.releaseMode === ReleaseMode.Staff && this.llm.isMock) {
      throw AppException.notFound();
    }
    return true;
  }
}

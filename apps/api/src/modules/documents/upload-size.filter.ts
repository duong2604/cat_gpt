import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type ApiErrorBody, ErrorCode } from '@cat-gpt/shared';

/**
 * multer's own `limits.fileSize` rejects an oversized file as `PayloadTooLargeException`
 * (413) before the controller runs. AC2 expects `400 FILE_TOO_LARGE` like every other
 * upload-validation error, so this route-scoped filter normalizes just that one case
 * for the documents upload endpoint (the global filter already maps 413 → the right
 * error *code*, just not the 400 status AC2 wants).
 */
@Catch(PayloadTooLargeException)
export class UploadSizeFilter implements ExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const body: ApiErrorBody = {
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.FILE_TOO_LARGE,
      message: ErrorCode.FILE_TOO_LARGE,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    };
    res.status(body.statusCode).json(body);
  }
}

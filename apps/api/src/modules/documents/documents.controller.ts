import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { Readable } from 'node:stream';
import type { DocumentDto, Paginated } from '@cat-gpt/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { DocumentsHiddenGuard } from './documents-hidden.guard.js';
import { DocumentsService } from './documents.service.js';
import { DocumentSummaryService } from './document-summary.service.js';
import { DocumentPageResponse, DocumentResponse } from './dto/document.response.js';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto.js';
import { UploadSizeFilter } from './upload-size.filter.js';

/** Giới hạn cứng của multer; kiểm tra thật (DOCUMENT_MAX_SIZE_MB) nằm trong DocumentsService. */
const UPLOAD_HARD_LIMIT_BYTES = 25 * 1024 * 1024;

/**
 * Chờ byte đầu tiên (hoặc kết thúc khi tệp rỗng). Lỗi trước byte đầu được ném ra để
 * AllExceptionsFilter trả JSON như các lỗi khác — chưa gửi header nên còn kịp.
 */
function waitForFirstChunk(stream: Readable): Promise<void> {
  return new Promise((resolve, reject) => {
    const settle = (error?: Error) => {
      stream.off('readable', onReady);
      stream.off('end', onReady);
      stream.off('error', onError);
      if (error) reject(error);
      else resolve();
    };
    const onReady = () => settle();
    const onError = (error: Error) => settle(error);
    stream.on('readable', onReady);
    stream.on('end', onReady);
    stream.on('error', onError);
  });
}

@ApiTags('Documents')
@ApiCookieAuth()
@UseGuards(DocumentsHiddenGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(
    private readonly documents: DocumentsService,
    private readonly summary: DocumentSummaryService,
  ) {}

  @Post()
  @UseFilters(UploadSizeFilter)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: UPLOAD_HARD_LIMIT_BYTES } }))
  @ApiOperation({ summary: 'Tải lên tệp TXT, PDF (dạng text) hoặc DOCX' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: DocumentResponse })
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<DocumentDto> {
    return this.documents.upload(user.userId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tài liệu của tôi' })
  @ApiOkResponse({ type: DocumentPageResponse })
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListDocumentsQueryDto,
  ): Promise<Paginated<DocumentDto>> {
    return this.documents.list(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tài liệu' })
  @ApiOkResponse({ type: DocumentResponse })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<DocumentDto> {
    return this.documents.getDto(user.userId, id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Tải xuống tệp gốc' })
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { document, stream } = await this.documents.download(user.userId, id);

    // Lỗi stream (MinIO đứt giữa chừng) không được để không có listener: thiếu listener thì
    // Node làm sập cả tiến trình API. Trước khi sẵn sàng thì lỗi được ném ra cho filter;
    // sau đó thì hủy kết nối tải về.
    let streamError: Error | null = null;
    let ready = false;
    stream.on('error', (error: Error) => {
      streamError = error;
      if (ready) {
        this.logger.warn(`documentId=${id} tải về lỗi giữa chừng: ${error.name}: ${error.message}`);
        res.destroy(error);
      }
    });
    await waitForFirstChunk(stream);
    if (streamError) throw streamError;
    ready = true;

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(document.name)}`,
      'Cache-Control': 'private, no-store',
    });
    // Client ngắt giữa chừng thì hủy luôn stream MinIO (không để kết nối treo).
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  }

  /** 202 khi đã xếp (hoặc đang chạy) job tóm tắt; 200 khi trả bản đã lưu, không gọi LLM. */
  @Post(':id/summary')
  @ApiOperation({ summary: 'Tóm tắt tài liệu (xếp job nền, hoặc trả bản đã lưu)' })
  @ApiOkResponse({ type: DocumentResponse })
  async summarize(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DocumentDto> {
    const { document, accepted } = await this.summary.requestSummary(user.userId, id);
    res.status(accepted ? HttpStatus.ACCEPTED : HttpStatus.OK);
    return document;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa tài liệu (kể cả đang xử lý)' })
  @ApiNoContentResponse()
  async delete(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    await this.documents.delete(user.userId, id);
  }
}

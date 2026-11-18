import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import type { Queue } from 'bullmq';
import { isValidObjectId, Model, type QueryFilter, Types } from 'mongoose';
import type { Readable } from 'node:stream';
import { type DocumentDto, DocumentStatus, ErrorCode, type Paginated } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex } from '../../common/utils/escape-regex.js';
import { withTimeout } from '../../common/utils/with-timeout.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { DocumentFilesService } from './document-files.service.js';
import { toDocumentDto } from './document.presenter.js';
import type { ListDocumentsQueryDto } from './dto/list-documents-query.dto.js';
import { fixMulterFilenameEncoding, sanitizeFileName } from './sanitize-filename.js';
import { DocumentEntity } from './schemas/document.schema.js';
import { isValidDocxSignature, isValidPdfSignature, isValidTxtSignature } from './text-extract.js';

export interface ProcessJobData {
  documentId: string;
}
export interface DeleteJobData {
  documentId: string;
}

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Kiểm chữ ký theo đuôi tệp (thiết kế mục 5, không tin `Content-Type` client). */
async function detectMimeType(file: Express.Multer.File): Promise<string | null> {
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.txt')) return isValidTxtSignature(file.buffer) ? 'text/plain' : null;
  if (name.endsWith('.pdf')) return isValidPdfSignature(file.buffer) ? 'application/pdf' : null;
  if (name.endsWith('.docx')) {
    return (await isValidDocxSignature(file.buffer)) ? DOCX_MIME_TYPE : null;
  }
  return null;
}

const DELETE_JOB_ATTEMPTS = 5;
const JOB_BACKOFF_DELAY_MS = 5000;
const FAILED_JOB_RETENTION_SECONDS = 7 * 24 * 3600;
/**
 * ioredis mặc định xếp lệnh vào hàng đợi trong bộ nhớ khi mất kết nối thay vì báo lỗi
 * ngay (AC6/T9 cần `queue.add` thất bại nhanh khi Redis tắt). Giới hạn thời gian chờ
 * thay vì đổi cấu hình kết nối dùng chung với Worker (ponytail: timeout đơn giản hơn
 * và không ảnh hưởng hành vi đọc job của Worker).
 */
const QUEUE_ADD_TIMEOUT_MS = 3000;

/** Nghiệp vụ + quyền + vòng đời tài liệu. Mọi truy vấn lọc theo `userId` người gọi (M3-2). */
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(DocumentEntity.name) private readonly documentModel: Model<DocumentEntity>,
    @InjectQueue('documents') private readonly queue: Queue,
    private readonly files: DocumentFilesService,
    private readonly config: AppConfigService,
  ) {}

  async upload(userId: string, file: Express.Multer.File | undefined): Promise<DocumentDto> {
    if (!file) throw AppException.badRequest(ErrorCode.FILE_REQUIRED);
    if (file.size > this.config.documents.maxSizeBytes) {
      throw AppException.badRequest(ErrorCode.FILE_TOO_LARGE);
    }
    const mimeType = await detectMimeType(file);
    if (!mimeType) throw AppException.badRequest(ErrorCode.FILE_INVALID_TYPE);

    const _id = new Types.ObjectId();
    const storageKey = `documents/${userId}/${_id.toString()}`;
    const name = sanitizeFileName(fixMulterFilenameEncoding(file.originalname));

    await this.files.put(storageKey, file.buffer, mimeType);

    let doc: DocumentEntity;
    try {
      doc = (
        await this.documentModel.create({
          _id,
          userId: new Types.ObjectId(userId),
          name,
          mimeType,
          size: file.size,
          storageKey,
          status: DocumentStatus.PENDING,
        })
      ).toObject();
    } catch (error) {
      await this.removeFileBestEffort(storageKey);
      throw error;
    }

    try {
      await withTimeout(
        this.queue.add(
          'process',
          { documentId: _id.toString() } satisfies ProcessJobData,
          {
            jobId: `process-${_id.toString()}`,
            attempts: this.config.documents.jobAttempts,
            backoff: { type: 'exponential', delay: JOB_BACKOFF_DELAY_MS },
            removeOnComplete: true,
            removeOnFail: { age: FAILED_JOB_RETENTION_SECONDS },
          },
        ),
        QUEUE_ADD_TIMEOUT_MS,
        `Hết thời gian chờ sau ${QUEUE_ADD_TIMEOUT_MS}ms`,
      );
    } catch {
      await this.documentModel.deleteOne({ _id }).exec();
      await this.removeFileBestEffort(storageKey);
      throw new AppException(ErrorCode.DOCUMENT_QUEUE_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return toDocumentDto(doc);
  }

  /**
   * Dọn object MinIO khi hoàn tác upload (lỗi Mongo hoặc hàng đợi). Không để lỗi dọn dẹp
   * che mất lỗi gốc đang được trả về — khác với job `delete` của worker, nơi lỗi phải
   * được ném ra để BullMQ thử lại (xem `DocumentFilesService.remove`).
   */
  private async removeFileBestEffort(storageKey: string): Promise<void> {
    try {
      await this.files.remove(storageKey);
    } catch (error) {
      this.logger.warn(`Không xóa được object MinIO ${storageKey} khi hoàn tác: ${(error as Error).message}`);
    }
  }

  async list(userId: string, query: ListDocumentsQueryDto): Promise<Paginated<DocumentDto>> {
    const filter: QueryFilter<DocumentEntity> = {
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    };
    if (query.q) filter.name = new RegExp(escapeRegex(query.q), 'i');
    if (query.status) filter.status = query.status;

    const [rows, total] = await Promise.all([
      this.documentModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(query.skip)
        .limit(query.pageSize)
        .lean<DocumentEntity[]>()
        .exec(),
      this.documentModel.countDocuments(filter).exec(),
    ]);

    return { items: rows.map(toDocumentDto), meta: query.toMeta(total) };
  }

  async getOwnedOrThrow(userId: string, id: string): Promise<DocumentEntity> {
    const doc = isValidObjectId(id)
      ? await this.documentModel
          .findOne({ _id: id, userId: new Types.ObjectId(userId), deletedAt: null })
          .lean<DocumentEntity>()
          .exec()
      : null;
    if (!doc) throw AppException.notFound(ErrorCode.DOCUMENT_NOT_FOUND);
    return doc;
  }

  async getDto(userId: string, id: string): Promise<DocumentDto> {
    return toDocumentDto(await this.getOwnedOrThrow(userId, id));
  }

  async download(userId: string, id: string): Promise<{ document: DocumentEntity; stream: Readable }> {
    const document = await this.getOwnedOrThrow(userId, id);
    const stream = await this.files.getStream(document.storageKey);
    return { document, stream };
  }

  /** Đặt `deletedAt` ngay rồi đưa job `delete` dọn Qdrant/MinIO/Mongo (thiết kế mục 6.4). */
  async delete(userId: string, id: string): Promise<void> {
    if (!isValidObjectId(id)) throw AppException.notFound(ErrorCode.DOCUMENT_NOT_FOUND);
    const result = await this.documentModel
      .updateOne(
        { _id: id, userId: new Types.ObjectId(userId), deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();
    if (result.matchedCount === 0) throw AppException.notFound(ErrorCode.DOCUMENT_NOT_FOUND);

    try {
      await withTimeout(
        this.queue.add(
          'delete',
          { documentId: id } satisfies DeleteJobData,
          {
            jobId: `delete-${id}`,
            attempts: DELETE_JOB_ATTEMPTS,
            backoff: { type: 'exponential', delay: JOB_BACKOFF_DELAY_MS },
            removeOnComplete: true,
            removeOnFail: { age: FAILED_JOB_RETENTION_SECONDS },
          },
        ),
        QUEUE_ADD_TIMEOUT_MS,
        `Hết thời gian chờ sau ${QUEUE_ADD_TIMEOUT_MS}ms`,
      );
    } catch (error) {
      // Tài liệu đã ẩn (deletedAt đã đặt) — vẫn trả 204, chỉ cảnh báo để dọn tay (thiết kế mục 6.4 bước 4).
      this.logger.warn(`documentId=${id} không đưa được job delete vào hàng đợi: ${(error as Error).message}`);
    }
  }
}

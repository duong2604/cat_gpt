import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Job, UnrecoverableError } from 'bullmq';
import { Model, Types } from 'mongoose';
import { DocumentStatus, ErrorCode } from '@cat-gpt/shared';
import { AppConfigService } from '../../config/app-config.service.js';
import { chunkText } from './chunk-text.js';
import { DocumentFilesService } from './document-files.service.js';
import type { DeleteJobData, ProcessJobData } from './documents.service.js';
import { EmbeddingService } from './embedding.service.js';
import { permanentErrorFor } from './permanent-error.js';
import { DocumentEntity } from './schemas/document.schema.js';
import { extractTxt } from './text-extract.js';
import { VectorStoreService } from './vector-store.service.js';

/**
 * Worker BullMQ cho queue `documents` (thiết kế mục 6.3, 6.4). Chạy trong tiến trình API
 * (ponytail: tách tiến trình worker riêng khi cần mở rộng — @nestjs/bullmq processor
 * trong module riêng, đủ cho prototype và một máy dev).
 */
@Processor('documents')
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    @InjectModel(DocumentEntity.name) private readonly documentModel: Model<DocumentEntity>,
    private readonly files: DocumentFilesService,
    private readonly vectors: VectorStoreService,
    private readonly embeddings: EmbeddingService,
    private readonly config: AppConfigService,
  ) {
    super();
  }

  async process(job: Job<ProcessJobData | DeleteJobData>): Promise<void> {
    if (job.name === 'delete') {
      return this.handleDelete(job as Job<DeleteJobData>);
    }
    return this.handleProcess(job as Job<ProcessJobData>);
  }

  private async handleProcess(job: Job<ProcessJobData>): Promise<void> {
    const { documentId } = job.data;
    const _id = new Types.ObjectId(documentId);

    const toProcessing = await this.documentModel
      .updateOne(
        { _id, deletedAt: null, status: { $in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING] } },
        { $set: { status: DocumentStatus.PROCESSING } },
      )
      .exec();
    if (toProcessing.matchedCount === 0) {
      this.logger.log(`documentId=${documentId} bỏ qua: đã bị xóa hoặc đổi trạng thái`);
      return;
    }

    const doc = await this.documentModel.findById(_id).lean<DocumentEntity>().exec();
    if (!doc) return;

    const buffer = await this.files.getBuffer(doc.storageKey);
    let text: string;
    try {
      text = extractTxt(buffer);
    } catch {
      return this.failPermanently(_id, ErrorCode.DOCUMENT_NO_TEXT);
    }

    const chunks = await chunkText(
      text,
      this.config.documents.chunkSize,
      this.config.documents.chunkOverlap,
    );

    const permanentError = permanentErrorFor(
      text,
      chunks,
      this.config.documents.maxChunks,
      Boolean(this.config.llm.openAiApiKey),
    );
    if (permanentError) {
      return this.failPermanently(_id, permanentError);
    }
    // Lỗi mạng/429/5xx ném ra ngoài — BullMQ thử lại (lỗi tạm thời, thiết kế mục 6.3 bước 3).
    const vectors = await this.embeddings.embedAll(chunks);

    // Xóa point cũ rồi upsert mới — chạy lại job không sinh trùng hay sót đoạn cũ (mục 6.3 bước 4).
    await this.vectors.deleteByDocumentId(documentId);
    await this.vectors.upsertChunks(
      doc.userId.toString(),
      documentId,
      chunks.map((text, chunkIndex) => ({ chunkIndex, text, vector: vectors[chunkIndex] })),
    );

    const fresh = await this.documentModel.findById(_id).lean<DocumentEntity>().exec();
    if (!fresh || fresh.deletedAt) {
      await this.vectors.deleteByDocumentId(documentId);
      return;
    }

    await this.documentModel
      .updateOne(
        { _id, deletedAt: null },
        { $set: { status: DocumentStatus.READY, chunkCount: chunks.length, errorCode: null } },
      )
      .exec();
  }

  /** Lỗi vĩnh viễn (thiết kế mục 6.3 bước 2–3): FAILED ngay, không thử lại. */
  private async failPermanently(_id: Types.ObjectId, code: ErrorCode): Promise<never> {
    await this.documentModel
      .updateOne(
        { _id, deletedAt: null, status: { $in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING] } },
        { $set: { status: DocumentStatus.FAILED, errorCode: code } },
      )
      .exec();
    throw new UnrecoverableError(code);
  }

  /**
   * Lần thử cuối của một lỗi tạm thời vẫn lỗi → FAILED (thiết kế mục 6.3 bước 7).
   * Lỗi vĩnh viễn đã tự đặt FAILED trong `failPermanently` — bỏ qua ở đây.
   */
  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error): Promise<void> {
    if (error instanceof UnrecoverableError) return;
    const attempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < attempts) return;

    const { documentId } = job.data as ProcessJobData | DeleteJobData;

    if (job.name === 'delete') {
      // Hết lượt thử dọn (vd MinIO không sẵn sàng suốt): bản ghi còn deletedAt là dấu vết
      // để dọn tay — chưa có job quét dọn định kỳ (thiết kế mục 6.4 bước 4, ghi chú ponytail).
      this.logger.warn(`documentId=${documentId} job=delete hết lượt thử, reason=${error.message}`);
      return;
    }
    if (job.name !== 'process') return;

    await this.documentModel
      .updateOne(
        {
          _id: new Types.ObjectId(documentId),
          deletedAt: null,
          status: { $in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING] },
        },
        { $set: { status: DocumentStatus.FAILED, errorCode: ErrorCode.DOCUMENT_PROCESSING_FAILED } },
      )
      .exec();
    // Chỉ số liệu để chẩn đoán — không ghi nội dung tài liệu hay khóa API (thiết kế mục 7).
    this.logger.warn(
      `documentId=${documentId} errorCode=${ErrorCode.DOCUMENT_PROCESSING_FAILED} reason=${error.message}`,
    );
  }

  /** Idempotent — mỗi bước bỏ qua "không tồn tại" (thiết kế mục 6.4 bước 2). */
  private async handleDelete(job: Job<DeleteJobData>): Promise<void> {
    const { documentId } = job.data;
    const doc = await this.documentModel.findById(documentId).lean<DocumentEntity>().exec();

    await this.vectors.deleteByDocumentId(documentId);
    if (doc) await this.files.remove(doc.storageKey);
    await this.documentModel.deleteOne({ _id: new Types.ObjectId(documentId) }).exec();
  }
}

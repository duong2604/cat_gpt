import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import type { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import { type DocumentDto, DocumentStatus, ErrorCode, SummaryStatus } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import { withTimeout } from '../../common/utils/with-timeout.js';
import { toDocumentDto } from './document.presenter.js';
import { DocumentEntity } from './schemas/document.schema.js';
import {
  DocumentsService,
  FAILED_JOB_RETENTION_SECONDS,
  JOB_BACKOFF_DELAY_MS,
  QUEUE_ADD_TIMEOUT_MS,
  type SummarizeJobData,
} from './documents.service.js';

/** Thiết kế mục 8: job tóm tắt thử tối đa 2 lượt. */
const SUMMARY_JOB_ATTEMPTS = 2;

/**
 * Lập lịch tóm tắt tài liệu (SE-016): kiểm trạng thái, đặt PENDING có điều kiện, xếp job nền
 * `summarize-<id>`. Tách khỏi DocumentsService (SE-F20); không đổi hành vi.
 */
@Injectable()
export class DocumentSummaryService {
  constructor(
    @InjectModel(DocumentEntity.name) private readonly documentModel: Model<DocumentEntity>,
    @InjectQueue('documents') private readonly queue: Queue,
    private readonly documents: DocumentsService,
  ) {}

  /**
   * Yêu cầu tóm tắt (SE-016). Đã có bản lưu → `accepted: false` (controller trả 200, không gọi LLM).
   * Đang PENDING → `accepted: true` không xếp thêm job. Còn lại → đặt PENDING có điều kiện rồi
   * xếp job `summarize-<id>`; nếu job cũ đã FAILED còn trong queue thì xóa để xếp lại.
   */
  async requestSummary(userId: string, id: string): Promise<{ document: DocumentDto; accepted: boolean }> {
    const doc = await this.documents.getOwnedOrThrow(userId, id);
    if (doc.status !== DocumentStatus.READY) throw AppException.badRequest(ErrorCode.DOCUMENT_NOT_READY);
    if (doc.summaryStatus === SummaryStatus.READY && doc.summary) {
      return { document: toDocumentDto(doc), accepted: false };
    }
    if (doc.summaryStatus === SummaryStatus.PENDING) {
      // Job còn sống thì không xếp thêm. Job đã mất (ví dụ bị phiên bản cũ bỏ qua) thì xếp lại:
      // trạng thái PENDING trong Mongo không tự chứng minh job đang chạy.
      if (await this.isSummaryJobAlive(id)) return { document: toDocumentDto(doc), accepted: true };
      await this.enqueueSummary(id, SummaryStatus.PENDING);
      const refreshed = await this.documents.getOwnedOrThrow(userId, id);
      return { document: toDocumentDto(refreshed), accepted: true };
    }

    const _id = new Types.ObjectId(id);
    const claim = await this.documentModel
      .updateOne(
        {
          _id,
          deletedAt: null,
          status: DocumentStatus.READY,
          summaryStatus: { $ne: SummaryStatus.PENDING },
        },
        { $set: { summaryStatus: SummaryStatus.PENDING, summaryErrorCode: null } },
      )
      .exec();
    if (claim.matchedCount === 0) {
      // Yêu cầu đồng thời đã thắng, hoặc tài liệu vừa bị xóa.
      const current = await this.documents.getOwnedOrThrow(userId, id);
      return { document: toDocumentDto(current), accepted: current.summaryStatus === SummaryStatus.PENDING };
    }

    await this.enqueueSummary(id, doc.summaryStatus ?? null);
    const fresh = await this.documents.getOwnedOrThrow(userId, id);
    return { document: toDocumentDto(fresh), accepted: true };
  }

  /** Job tóm tắt còn trong queue và chưa FAILED. */
  private async isSummaryJobAlive(id: string): Promise<boolean> {
    const job = await this.queue.getJob(`summarize-${id}`);
    if (!job) return false;
    return !(await job.isFailed());
  }

  /**
   * Xếp job `summarize-<id>`. Job FAILED cũ còn trong queue bị xóa để xếp lại (jobId trùng sẽ
   * bị BullMQ bỏ qua). Lỗi xếp → trả `summaryStatus` về `revertTo` rồi báo 503.
   */
  private async enqueueSummary(id: string, revertTo: string | null): Promise<void> {
    const jobId = `summarize-${id}`;
    try {
      await withTimeout(
        (async () => {
          const old = await this.queue.getJob(jobId);
          if (old && (await old.isFailed())) await old.remove();
          await this.queue.add(
            'summarize',
            { documentId: id } satisfies SummarizeJobData,
            {
              jobId,
              attempts: SUMMARY_JOB_ATTEMPTS,
              backoff: { type: 'exponential', delay: JOB_BACKOFF_DELAY_MS },
              removeOnComplete: true,
              removeOnFail: { age: FAILED_JOB_RETENTION_SECONDS },
            },
          );
        })(),
        QUEUE_ADD_TIMEOUT_MS,
        `Hết thời gian chờ sau ${QUEUE_ADD_TIMEOUT_MS}ms`,
      );
    } catch {
      await this.documentModel
        .updateOne({ _id: new Types.ObjectId(id), deletedAt: null }, { $set: { summaryStatus: revertTo } })
        .exec();
      throw new AppException(ErrorCode.DOCUMENT_QUEUE_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentStatus } from '@cat-gpt/shared';
import { AppConfigService } from '../../config/app-config.service.js';
import { EmbeddingService } from '../documents/embedding.service.js';
import { DocumentEntity } from '../documents/schemas/document.schema.js';
import { VectorStoreService } from '../documents/vector-store.service.js';

export interface RagSource {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  page?: number;
  text: string;
}

export type RagPlan =
  | { kind: 'insufficient'; reason: 'DOCUMENTS_UNAVAILABLE' | 'NO_MATCH' }
  | { kind: 'ready'; sources: RagSource[] };

/**
 * Nghiệp vụ truy hồi cho hỏi đáp tài liệu (thiết kế mục 6.1, M4-2). `ChatService` chỉ gọi
 * `prepare()` (và `verifyCitations()` ở CP3) khi hội thoại có `documentIds`.
 */
@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @InjectModel(DocumentEntity.name) private readonly documents: Model<DocumentEntity>,
    private readonly embeddings: EmbeddingService,
    private readonly vectors: VectorStoreService,
    private readonly config: AppConfigService,
  ) {}

  async prepare(userId: string, documentIds: Types.ObjectId[], question: string): Promise<RagPlan> {
    // Bước 1 (thiết kế 6.1): lọc lại — tài liệu có thể bị xóa/đổi trạng thái sau khi hội
    // thoại được tạo. Không tin thẳng documentIds của hội thoại.
    const validDocs = await this.documents
      .find({
        _id: { $in: documentIds },
        userId: new Types.ObjectId(userId),
        status: DocumentStatus.READY,
        deletedAt: null,
      })
      .lean<DocumentEntity[]>()
      .exec();
    if (validDocs.length === 0) {
      return { kind: 'insufficient', reason: 'DOCUMENTS_UNAVAILABLE' };
    }
    const nameById = new Map(validDocs.map((d) => [d._id.toString(), d.name]));

    // Bước 2: embed câu hỏi mới nhất — không viết lại câu hỏi (M4-5, bản đầu).
    const [vector] = await this.embeddings.embedAll([question]);

    // Bước 3: Qdrant, lọc userId + documentId ∈ danh sách hợp lệ.
    const results = await this.vectors.search(vector, {
      userId,
      documentIds: [...nameById.keys()],
      limit: this.config.rag.topK,
    });

    // Bước 4: RAG_MIN_SCORE để trống = không lọc (M4-3).
    const minScore = this.config.rag.minScore;
    const filtered = minScore === undefined ? results : results.filter((r) => r.score >= minScore);

    // Chỉ ghi chỉ số (documentId, chunkIndex, score) — không bao giờ ghi nội dung đoạn (thiết kế mục 7).
    this.logger.debug(
      `Truy hồi userId=${userId} top=${filtered.length}/${results.length}: ` +
        filtered.map((r) => `${r.documentId}#${r.chunkIndex}(${r.score.toFixed(3)})`).join(', '),
    );

    if (filtered.length === 0) {
      return { kind: 'insufficient', reason: 'NO_MATCH' };
    }

    return {
      kind: 'ready',
      sources: filtered.map((r) => ({
        documentId: r.documentId,
        documentName: nameById.get(r.documentId) ?? '',
        chunkIndex: r.chunkIndex,
        ...(r.page !== undefined ? { page: r.page } : {}),
        text: r.text,
      })),
    };
  }
}

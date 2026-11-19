import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentStatus } from '@cat-gpt/shared';
import { AppConfigService } from '../../config/app-config.service.js';
import { EmbeddingService } from '../documents/embedding.service.js';
import { DocumentEntity } from '../documents/schemas/document.schema.js';
import { VectorStoreService } from '../documents/vector-store.service.js';
import { buildRagSystemPrompt, RAG_REFUSAL_TEXT } from './rag-prompt.js';

export interface RagSource {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  page?: number;
  text: string;
}

export type RagPlan =
  | { kind: 'insufficient'; reason: 'DOCUMENTS_UNAVAILABLE' | 'NO_MATCH' }
  | { kind: 'ready'; systemPrompt: string; sources: RagSource[] };

export interface VerifiedCitation {
  n: number;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  page?: number;
  quote: string;
}

export interface VerifyCitationsResult {
  citations: VerifiedCitation[];
  insufficientEvidence: boolean;
  ungrounded: boolean;
}

/** `quote` cắt từ `text` của đoạn — luôn là chuỗi con, không bao giờ vượt quá (thiết kế mục 4). */
const QUOTE_MAX_LENGTH = 300;
/** Khớp `[n]`, `[n, m]`, và lặp lại cho `[n][m]` (mỗi cặp ngoặc một lượt khớp riêng). */
const CITATION_PATTERN = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

/**
 * Nghiệp vụ truy hồi + xác minh trích dẫn cho hỏi đáp tài liệu (thiết kế mục 6.1, 6.3;
 * M4-2). `ChatService` chỉ gọi `prepare()` và `verifyCitations()` khi hội thoại có
 * `documentIds`.
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

    const sources: RagSource[] = filtered.map((r) => ({
      documentId: r.documentId,
      documentName: nameById.get(r.documentId) ?? '',
      chunkIndex: r.chunkIndex,
      ...(r.page !== undefined ? { page: r.page } : {}),
      text: r.text,
    }));
    return { kind: 'ready', systemPrompt: buildRagSystemPrompt(sources), sources };
  }

  /**
   * Xác minh trích dẫn sau khi LLM trả lời xong (thiết kế mục 6.3) — logic thuần, không
   * gọi dịch vụ ngoài. Nguồn chỉ có thể là đoạn đã truy hồi; câu từ chối nhận diện bằng
   * so khớp chuỗi, không cần ngưỡng.
   */
  verifyCitations(content: string, sources: RagSource[]): VerifyCitationsResult {
    const trimmed = content.trim();
    if (trimmed.startsWith(RAG_REFUSAL_TEXT)) {
      return { citations: [], insufficientEvidence: true, ungrounded: false };
    }

    const validNs = new Set<number>();
    let outOfRange = 0;
    for (const match of trimmed.matchAll(CITATION_PATTERN)) {
      for (const part of match[1].split(',')) {
        const n = Number(part.trim());
        if (n >= 1 && n <= sources.length) validNs.add(n);
        else outOfRange++;
      }
    }
    if (outOfRange > 0) {
      this.logger.debug(`verifyCitations: bỏ ${outOfRange} trích dẫn ngoài khoảng (có ${sources.length} đoạn)`);
    }

    const citations: VerifiedCitation[] = [...validNs]
      .sort((a, b) => a - b)
      .map((n) => {
        const s = sources[n - 1];
        return {
          n,
          documentId: s.documentId,
          documentName: s.documentName,
          chunkIndex: s.chunkIndex,
          ...(s.page !== undefined ? { page: s.page } : {}),
          quote: s.text.slice(0, QUOTE_MAX_LENGTH),
        };
      });

    return { citations, insufficientEvidence: false, ungrounded: citations.length === 0 };
  }
}

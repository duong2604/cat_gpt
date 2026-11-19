import { Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from '../../config/app-config.service.js';

export interface ChunkPoint {
  chunkIndex: number;
  text: string;
  vector: number[];
  /** Trang nguồn (chỉ PDF — thiết kế mục 4.3, SE-013). */
  page?: number;
}

export interface SearchResult {
  documentId: string;
  chunkIndex: number;
  score: number;
  text: string;
  page?: number;
}

export interface SearchOptions {
  userId: string;
  documentIds: string[];
  limit: number;
}

/**
 * Qdrant: một collection dùng chung, payload `{ userId, documentId, chunkIndex, text }`
 * (PDF thêm `page` — thiết kế mục 4.3, SE-013).
 * Kích thước vector lấy từ lần embedding đầu tiên khi tạo collection (thiết kế mục 4.3).
 */
@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private readonly client: QdrantClient;
  private readonly collection: string;
  private ensured = false;

  constructor(config: AppConfigService) {
    this.client = new QdrantClient({ url: config.qdrant.url });
    this.collection = config.qdrant.collection;
  }

  private async ensureCollection(vectorSize: number): Promise<void> {
    if (this.ensured) return;

    const { exists } = await this.client.collectionExists(this.collection);
    if (!exists) {
      await this.client.createCollection(this.collection, {
        vectors: { size: vectorSize, distance: 'Cosine' },
      });
      await this.client.createPayloadIndex(this.collection, {
        field_name: 'userId',
        field_schema: 'keyword',
      });
      await this.client.createPayloadIndex(this.collection, {
        field_name: 'documentId',
        field_schema: 'keyword',
      });
      this.logger.log(`Đã tạo collection Qdrant "${this.collection}" (size=${vectorSize})`);
    } else {
      const info = await this.client.getCollection(this.collection);
      const vectors = info.config.params.vectors;
      const existingSize =
        vectors && typeof vectors === 'object' && 'size' in vectors ? vectors.size : undefined;
      if (typeof existingSize === 'number' && existingSize !== vectorSize) {
        throw new Error(
          `Collection "${this.collection}" có vector size ${existingSize}, khác với embedding hiện tại ${vectorSize} — đổi model thì đổi tên collection (QDRANT_COLLECTION)`,
        );
      }
    }
    this.ensured = true;
  }

  async upsertChunks(userId: string, documentId: string, chunks: ChunkPoint[]): Promise<void> {
    if (chunks.length === 0) return;
    await this.ensureCollection(chunks[0].vector.length);
    await this.client.upsert(this.collection, {
      wait: true,
      points: chunks.map((c) => ({
        id: randomUUID(),
        vector: c.vector,
        payload: {
          userId,
          documentId,
          chunkIndex: c.chunkIndex,
          text: c.text,
          ...(c.page !== undefined ? { page: c.page } : {}),
        },
      })),
    });
  }

  /**
   * Idempotent — không có point nào, hoặc collection chưa tồn tại (chưa ai xử lý xong
   * tài liệu nào), đều coi là không có gì để xóa (thiết kế mục 6.4: mỗi bước bỏ qua
   * "không tồn tại"). Worker cũng gọi hàm này trước upsert mỗi lần xử lý — nếu không
   * kiểm tồn tại trước, tài liệu đầu tiên trên một Qdrant mới sẽ không bao giờ tới READY.
   */
  async deleteByDocumentId(documentId: string): Promise<void> {
    const { exists } = await this.client.collectionExists(this.collection);
    if (!exists) return;
    await this.client.delete(this.collection, {
      wait: true,
      filter: { must: [{ key: 'documentId', match: { value: documentId } }] },
    });
  }

  /**
   * Truy hồi top-K đoạn gần nhất, lọc cả `userId` **và** `documentId ∈ danh sách` (M4-4,
   * thiết kế mục 6.1 bước 3) — gọi với danh sách tài liệu đã lọc hợp lệ ở Mongo, không
   * tin thẳng `documentIds` của hội thoại (tài liệu có thể bị xóa sau khi tạo).
   * Ngưỡng điểm (`RAG_MIN_SCORE`) là chính sách của RagService, không lọc ở đây.
   */
  async search(vector: number[], options: SearchOptions): Promise<SearchResult[]> {
    if (options.documentIds.length === 0) return [];
    const { exists } = await this.client.collectionExists(this.collection);
    if (!exists) return [];
    const result = await this.client.query(this.collection, {
      query: vector,
      filter: {
        must: [
          { key: 'userId', match: { value: options.userId } },
          { key: 'documentId', match: { any: options.documentIds } },
        ],
      },
      limit: options.limit,
      with_payload: true,
    });
    return result.points.map((p) => {
      const payload = p.payload as Record<string, unknown>;
      return {
        documentId: String(payload.documentId),
        chunkIndex: Number(payload.chunkIndex),
        score: p.score,
        text: String(payload.text),
        ...(payload.page !== undefined ? { page: Number(payload.page) } : {}),
      };
    });
  }

  async countByDocumentId(documentId: string): Promise<number> {
    const { exists } = await this.client.collectionExists(this.collection);
    if (!exists) return 0;
    const result = await this.client.count(this.collection, {
      filter: { must: [{ key: 'documentId', match: { value: documentId } }] },
      exact: true,
    });
    return result.count;
  }

  /** Mọi đoạn của một tài liệu, sắp theo `chunkIndex` (SE-016: tóm tắt toàn bộ nội dung). */
  async scrollByDocumentId(documentId: string): Promise<{ chunkIndex: number; text: string }[]> {
    const { exists } = await this.client.collectionExists(this.collection);
    if (!exists) return [];
    const chunks: { chunkIndex: number; text: string }[] = [];
    let offset: string | number | Record<string, unknown> | null | undefined;
    do {
      const page = await this.client.scroll(this.collection, {
        filter: { must: [{ key: 'documentId', match: { value: documentId } }] },
        limit: 256,
        with_payload: true,
        with_vector: false,
        offset,
      });
      for (const point of page.points) {
        const payload = point.payload as Record<string, unknown>;
        chunks.push({ chunkIndex: Number(payload.chunkIndex), text: String(payload.text) });
      }
      offset = page.next_page_offset;
    } while (offset !== null && offset !== undefined);
    return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }
}

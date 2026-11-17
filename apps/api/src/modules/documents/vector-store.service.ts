import { Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from '../../config/app-config.service.js';

export interface ChunkPoint {
  chunkIndex: number;
  text: string;
  vector: number[];
}

/**
 * Qdrant: một collection dùng chung, payload `{ userId, documentId, chunkIndex, text }`.
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
        payload: { userId, documentId, chunkIndex: c.chunkIndex, text: c.text },
      })),
    });
  }

  /** Idempotent — không lỗi nếu không có point nào theo documentId. */
  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.client.delete(this.collection, {
      wait: true,
      filter: { must: [{ key: 'documentId', match: { value: documentId } }] },
    });
  }

  async countByDocumentId(documentId: string): Promise<number> {
    const result = await this.client.count(this.collection, {
      filter: { must: [{ key: 'documentId', match: { value: documentId } }] },
      exact: true,
    });
    return result.count;
  }
}

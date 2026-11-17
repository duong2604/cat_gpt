import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from '../../config/app-config.service.js';

// ponytail: lô cố định 100 đoạn/lần, chưa tính theo số token — đủ cho DOCUMENT_MAX_CHUNKS=500 mặc định.
const EMBED_BATCH_SIZE = 100;

/** Nhúng văn bản bằng OpenAI Embeddings — một bản cài, không interface (M3-3, Simplicity First). */
@Injectable()
export class EmbeddingService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: AppConfigService) {
    this.model = config.documents.embeddingModel;
    this.client = new OpenAI({ apiKey: config.llm.openAiApiKey, maxRetries: 1 });
  }

  /** Ném lỗi gốc (mạng/429/5xx) để worker coi là lỗi tạm thời và thử lại. */
  async embedAll(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
      const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
      const response = await this.client.embeddings.create({ model: this.model, input: batch });
      const sorted = [...response.data].sort((a, b) => a.index - b.index);
      vectors.push(...sorted.map((d) => d.embedding));
    }
    return vectors;
  }
}

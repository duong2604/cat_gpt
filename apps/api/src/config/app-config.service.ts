import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_LLM_MODEL, EnvironmentVariables, NodeEnv, ReleaseMode } from './env.validation.js';

/**
 * Lớp bọc ConfigService để truy cập cấu hình có kiểu rõ ràng,
 * tránh rải chuỗi tên biến môi trường khắp codebase.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  private get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.config.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === NodeEnv.Production;
  }

  get port(): number {
    return this.get('PORT');
  }

  get mongodbUri(): string {
    return this.get('MONGODB_URI');
  }

  get auth() {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      accessTtlSeconds: this.get('ACCESS_TOKEN_TTL_SECONDS'),
      refreshTtlDays: this.get('REFRESH_TOKEN_TTL_DAYS'),
      cookieSecure: this.get('COOKIE_SECURE'),
    };
  }

  get corsOrigins(): string[] {
    const raw = this.get('CORS_ORIGINS');
    return raw ? raw.split(',').map((o) => o.trim()).filter(Boolean) : [];
  }

  get trustProxy(): string {
    return this.get('TRUST_PROXY');
  }

  get releaseMode(): ReleaseMode {
    return this.get('RELEASE_MODE');
  }

  get swaggerEnabled(): boolean {
    const explicit = this.get('SWAGGER_ENABLED');
    return explicit ?? this.releaseMode === ReleaseMode.Demo;
  }

  get uploadDir(): string {
    return this.get('UPLOAD_DIR');
  }

  get llm() {
    const provider = this.get('LLM_PROVIDER');
    return {
      provider,
      model: this.get('LLM_MODEL') ?? DEFAULT_LLM_MODEL[provider],
      systemPrompt: this.get('LLM_SYSTEM_PROMPT'),
      openAiApiKey: this.get('OPENAI_API_KEY') ?? '',
      maxOutputTokens: this.get('LLM_MAX_OUTPUT_TOKENS'),
      historyTokenBudget: this.get('LLM_HISTORY_TOKEN_BUDGET'),
    };
  }

  get seedAdmin() {
    return {
      email: this.get('ADMIN_EMAIL'),
      password: this.get('ADMIN_PASSWORD'),
      fullName: this.get('ADMIN_FULL_NAME'),
    };
  }

  get redis() {
    return { host: this.get('REDIS_HOST'), port: this.get('REDIS_PORT') };
  }

  get bullmqPrefix(): string {
    return this.get('BULLMQ_PREFIX');
  }

  get minio() {
    return {
      endPoint: this.get('MINIO_ENDPOINT'),
      port: this.get('MINIO_PORT'),
      useSSL: this.get('MINIO_USE_SSL'),
      accessKey: this.get('MINIO_ACCESS_KEY'),
      secretKey: this.get('MINIO_SECRET_KEY'),
      bucket: this.get('MINIO_BUCKET'),
    };
  }

  get qdrant() {
    return { url: this.get('QDRANT_URL'), collection: this.get('QDRANT_COLLECTION') };
  }

  get documents() {
    return {
      embeddingModel: this.get('EMBEDDING_MODEL'),
      maxSizeBytes: this.get('DOCUMENT_MAX_SIZE_MB') * 1024 * 1024,
      maxChunks: this.get('DOCUMENT_MAX_CHUNKS'),
      chunkSize: this.get('DOCUMENT_CHUNK_SIZE'),
      chunkOverlap: this.get('DOCUMENT_CHUNK_OVERLAP'),
      jobAttempts: this.get('DOCUMENT_JOB_ATTEMPTS'),
    };
  }
}

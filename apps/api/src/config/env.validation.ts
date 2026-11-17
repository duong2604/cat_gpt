import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum ReleaseMode {
  Demo = 'demo',
  Staff = 'staff',
}

export enum LlmProviderName {
  Mock = 'mock',
  OpenAi = 'openai',
}

/** Model mặc định theo provider khi không đặt LLM_MODEL. */
export const DEFAULT_LLM_MODEL: Record<LlmProviderName, string> = {
  [LlmProviderName.Mock]: 'mock-1',
  [LlmProviderName.OpenAi]: 'gpt-5.4-mini',
};

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

/**
 * Khai báo và kiểm tra toàn bộ biến môi trường khi khởi động.
 * Thiếu hoặc sai biến bắt buộc thì ứng dụng dừng ngay với thông báo rõ ràng.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 4000;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;

  @IsString()
  @MinLength(32, { message: 'JWT_ACCESS_SECRET phải dài tối thiểu 32 ký tự' })
  JWT_ACCESS_SECRET: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(60)
  ACCESS_TOKEN_TTL_SECONDS = 900;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  REFRESH_TOKEN_TTL_DAYS = 7;

  @Transform(toBoolean)
  @IsBoolean()
  COOKIE_SECURE = false;

  /** Danh sách origin cho phép CORS, phân tách bằng dấu phẩy. Để trống nếu FE gọi qua proxy cùng origin. */
  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  /** Giá trị cho Express `trust proxy` để lấy đúng IP client khi đi qua proxy. */
  @IsString()
  TRUST_PROXY = 'loopback';

  /** Không đặt → mặc định theo RELEASE_MODE (bật ở `demo`, tắt ở `staff`). */
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  SWAGGER_ENABLED?: boolean;

  /** `demo` (bản 20/11, mặc định) hoặc `staff` (thử nội bộ, ẩn Chat và tài liệu chưa sẵn sàng). */
  @IsEnum(ReleaseMode)
  RELEASE_MODE: ReleaseMode = ReleaseMode.Demo;

  @IsString()
  UPLOAD_DIR = 'uploads';

  @IsEmail()
  ADMIN_EMAIL: string;

  @IsString()
  @MinLength(8)
  ADMIN_PASSWORD: string;

  @IsString()
  ADMIN_FULL_NAME = 'Administrator';

  /** `mock` (mặc định, dùng cho demo và test local) hoặc `openai`. */
  @IsEnum(LlmProviderName)
  LLM_PROVIDER: LlmProviderName = LlmProviderName.Mock;

  /** Để trống → theo DEFAULT_LLM_MODEL của provider. */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  LLM_MODEL?: string;

  /** Bắt buộc khi LLM_PROVIDER=openai (kiểm tra ở validateEnv). Không bao giờ ghi ra log. */
  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(16)
  @Max(8192)
  LLM_MAX_OUTPUT_TOKENS = 1000;

  /** Ngân sách token (ước lượng) cho lịch sử hội thoại gửi lại mỗi lượt. */
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(500)
  @Max(100_000)
  LLM_HISTORY_TOKEN_BUDGET = 4000;

  @IsString()
  @IsNotEmpty()
  LLM_SYSTEM_PROMPT =
    'Bạn là CAT GPT, trợ lý AI nội bộ của công ty. Trả lời bằng tiếng Việt (trừ khi người dùng dùng ngôn ngữ khác), ngắn gọn, chính xác, trình bày bằng markdown khi phù hợp.';

  // ===== Hạ tầng dev (SE-010: docker-compose.yml — Redis, MinIO, Qdrant) =====
  @IsString()
  REDIS_HOST = 'localhost';

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT = 6379;

  /** Tách dữ liệu hàng đợi BullMQ giữa các phiên dev. */
  @IsString()
  BULLMQ_PREFIX = 'cat-gpt';

  @IsString()
  MINIO_ENDPOINT = 'localhost';

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  MINIO_PORT = 9000;

  @Transform(toBoolean)
  @IsBoolean()
  MINIO_USE_SSL = false;

  /** Bắt buộc — giá trị thật chỉ trong `.env` và `docker-compose.yml`, không commit. */
  @IsString()
  @IsNotEmpty()
  MINIO_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  MINIO_SECRET_KEY: string;

  /** Riêng tư — API không bật chính sách public khi tạo bucket (SE-011). */
  @IsString()
  MINIO_BUCKET = 'cat-gpt-dev';

  @IsString()
  QDRANT_URL = 'http://localhost:6333';

  @IsString()
  QDRANT_COLLECTION = 'document_chunks';

  // ===== Tài liệu (SE-011) =====
  @IsString()
  EMBEDDING_MODEL = 'text-embedding-3-small';

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  DOCUMENT_MAX_SIZE_MB = 20;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  DOCUMENT_MAX_CHUNKS = 500;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  DOCUMENT_CHUNK_SIZE = 1000;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  DOCUMENT_CHUNK_OVERLAP = 150;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  DOCUMENT_JOB_ATTEMPTS = 3;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    exposeDefaultValues: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  const lines = errors.flatMap((e) => Object.values(e.constraints ?? {}).map((m) => `  - ${m}`));
  if (validated.LLM_PROVIDER === LlmProviderName.OpenAi && !validated.OPENAI_API_KEY?.trim()) {
    lines.push('  - LLM_PROVIDER=openai cần OPENAI_API_KEY (đặt trong apps/api/.env, không commit)');
  }
  if (lines.length > 0) {
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${lines.join('\n')}`);
  }
  return validated;
}

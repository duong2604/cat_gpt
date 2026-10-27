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

  @Transform(toBoolean)
  @IsBoolean()
  SWAGGER_ENABLED = true;

  @IsString()
  UPLOAD_DIR = 'uploads';

  @IsEmail()
  ADMIN_EMAIL: string;

  @IsString()
  @MinLength(8)
  ADMIN_PASSWORD: string;

  @IsString()
  ADMIN_FULL_NAME = 'Administrator';

  @IsString()
  @IsNotEmpty()
  LLM_MODEL = 'mock-1';

  @IsString()
  @IsNotEmpty()
  LLM_SYSTEM_PROMPT =
    'Bạn là CAT GPT, trợ lý AI nội bộ của công ty. Trả lời bằng tiếng Việt (trừ khi người dùng dùng ngôn ngữ khác), ngắn gọn, chính xác, trình bày bằng markdown khi phù hợp.';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    exposeDefaultValues: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const lines = errors.flatMap((e) => Object.values(e.constraints ?? {}).map((m) => `  - ${m}`));
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${lines.join('\n')}`);
  }
  return validated;
}

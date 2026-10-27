import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from './env.validation.js';

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

  get swaggerEnabled(): boolean {
    return this.get('SWAGGER_ENABLED');
  }

  get uploadDir(): string {
    return this.get('UPLOAD_DIR');
  }

  get seedAdmin() {
    return {
      email: this.get('ADMIN_EMAIL'),
      password: this.get('ADMIN_PASSWORD'),
      fullName: this.get('ADMIN_FULL_NAME'),
    };
  }
}

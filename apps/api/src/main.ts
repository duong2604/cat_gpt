import dns from 'node:dns';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { ACCESS_TOKEN_COOKIE, API_PREFIX } from './common/constants.js';
import { appValidationPipe } from './common/pipes/app-validation.pipe.js';
import { AppConfigService } from './config/app-config.service.js';
import { applyDnsServers, isSrvDnsError, isSystemDnsLoopback } from './config/dns.js';

// DNS_SERVERS đọc từ .env (không nạp toàn bộ .env vào process.env) rồi áp trước khi Nest kết nối MongoDB.
const fileEnv = (() => {
  try {
    return parseEnv(readFileSync('.env', 'utf8'));
  } catch {
    return {} as Record<string, string>;
  }
})();
const dnsServers = process.env.DNS_SERVERS ?? fileEnv.DNS_SERVERS ?? '';
const mongoUri = process.env.MONGODB_URI ?? fileEnv.MONGODB_URI ?? '';
applyDnsServers(dnsServers);

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log(`DNS tiến trình trước khởi động: ${dns.getServers().join(',')} (DNS_SERVERS=${dnsServers.trim() || '<không đặt>'})`);
  if (mongoUri.startsWith('mongodb+srv://') && isSystemDnsLoopback() && !dnsServers.trim()) {
    logger.warn(
      'DNS hệ thống là loopback (127.0.0.1) và MONGODB_URI dùng mongodb+srv: nếu kết nối MongoDB lỗi querySrv ECONNREFUSED, ' +
        'đặt DNS_SERVERS=8.8.8.8,1.1.1.1 trong apps/api/.env rồi khởi động lại.',
    );
  }
  let app: NestExpressApplication;
  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
  } catch (error) {
    if (isSrvDnsError(error) && isSystemDnsLoopback() && !dnsServers.trim()) {
      logger.error(
        'Không phân giải được mongodb+srv: DNS hệ thống là loopback (127.0.0.1). ' +
          'Đặt DNS_SERVERS=8.8.8.8,1.1.1.1 trong apps/api/.env rồi khởi động lại.',
      );
    }
    throw error;
  }
  const config = app.get(AppConfigService);

  app.set('trust proxy', config.trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(appValidationPipe);
  app.enableShutdownHooks();

  if (config.corsOrigins.length > 0) {
    app.enableCors({ origin: config.corsOrigins, credentials: true });
  }

  if (config.swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('CAT GPT API')
        .setDescription('API hệ thống trợ lý AI nội bộ CAT GPT')
        .setVersion('0.1.0')
        .addCookieAuth(ACCESS_TOKEN_COOKIE)
        .build(),
    );
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, document, {
      swaggerOptions: { withCredentials: true, persistAuthorization: true },
    });
  }

  await app.listen(config.port);
  logger.log(`DNS tiến trình sau khởi động: ${dns.getServers().join(',')}`);
  logger.log(`API đang chạy tại http://localhost:${config.port}/${API_PREFIX}`);
  if (config.swaggerEnabled) {
    logger.log(`Swagger: http://localhost:${config.port}/${API_PREFIX}/docs`);
  }
}

await bootstrap();

import dns from 'node:dns';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { ACCESS_TOKEN_COOKIE, API_PREFIX, LOCAL_FILES_ROUTE } from './common/constants.js';
import { appValidationPipe } from './common/pipes/app-validation.pipe.js';
import { AppConfigService } from './config/app-config.service.js';
import { LocalStorageProvider } from './modules/storage/local-storage.provider.js';

// Node trên Windows đôi khi đọc DNS hệ thống thành 127.0.0.1 → SRV lookup của mongodb+srv lỗi ECONNREFUSED.
if (dns.getServers().every((s) => s.startsWith('127.') || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');

  app.set('trust proxy', config.trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(appValidationPipe);
  app.enableShutdownHooks();

  if (config.corsOrigins.length > 0) {
    app.enableCors({ origin: config.corsOrigins, credentials: true });
  }

  // Phục vụ file của LocalStorageProvider (avatar). Sẽ bỏ khi chuyển sang MinIO.
  app.useStaticAssets(app.get(LocalStorageProvider).rootDir, {
    prefix: LOCAL_FILES_ROUTE,
    index: false,
    dotfiles: 'deny',
    maxAge: '7d',
  });

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
  logger.log(`API đang chạy tại http://localhost:${config.port}/${API_PREFIX}`);
  if (config.swaggerEnabled) {
    logger.log(`Swagger: http://localhost:${config.port}/${API_PREFIX}/docs`);
  }
}

await bootstrap();

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { AppConfigModule } from './config/app-config.module.js';
import { AppConfigService } from './config/app-config.service.js';
import { AdminUsersModule } from './modules/admin-users/admin-users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { HealthController } from './modules/health/health.controller.js';
import { MeModule } from './modules/me/me.module.js';
import { StorageModule } from './modules/storage/storage.module.js';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({ uri: config.mongodbUri }),
    }),
    // Giới hạn chung: 120 request/phút/IP. Endpoint đăng nhập có giới hạn riêng chặt hơn.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    StorageModule,
    AuthModule,
    MeModule,
    AdminUsersModule,
    ChatModule,
  ],
  controllers: [HealthController],
  providers: [
    // Thứ tự guard: chống spam → xác thực → phân quyền.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}

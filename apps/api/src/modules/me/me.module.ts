import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module.js';
import { UsersModule } from '../users/users.module.js';
import { MeController } from './me.controller.js';
import { MeService } from './me.service.js';

@Module({
  imports: [UsersModule, SessionsModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}

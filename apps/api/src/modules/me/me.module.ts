import { Module } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { UsersModule } from '../users/users.module.js';
import { MeController } from './me.controller.js';
import { MeService } from './me.service.js';

@Module({
  imports: [UsersModule, SessionsModule, LlmModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}

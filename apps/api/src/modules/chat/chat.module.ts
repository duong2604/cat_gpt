import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsModule } from '../documents/documents.module.js';
import { LlmModule } from '../llm/llm.module.js';
import { RagModule } from '../rag/rag.module.js';
import { ChatHiddenGuard } from './chat-hidden.guard.js';
import { ChatThrottlerGuard } from './chat-throttler.guard.js';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsService } from './conversations.service.js';
import { Conversation, ConversationSchema } from './schemas/conversation.schema.js';
import { Message, MessageSchema } from './schemas/message.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    LlmModule,
    DocumentsModule,
    RagModule,
  ],
  controllers: [ConversationsController, ChatController],
  providers: [ConversationsService, ChatService, ChatThrottlerGuard, ChatHiddenGuard],
})
export class ChatModule {}

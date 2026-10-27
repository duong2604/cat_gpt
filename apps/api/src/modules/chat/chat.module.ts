import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmModule } from '../llm/llm.module.js';
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
  ],
  controllers: [ConversationsController, ChatController],
  providers: [ConversationsService, ChatService],
})
export class ChatModule {}

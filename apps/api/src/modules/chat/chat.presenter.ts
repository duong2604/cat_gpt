import type { ConversationDto, MessageDto } from '@cat-gpt/shared';
import type { Conversation } from './schemas/conversation.schema.js';
import type { Message } from './schemas/message.schema.js';

export function toConversationDto(c: Conversation): ConversationDto {
  return {
    id: c._id.toString(),
    title: c.title,
    lastMessageAt: c.lastMessageAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function toMessageDto(m: Message): MessageDto {
  return {
    id: m._id.toString(),
    conversationId: m.conversationId.toString(),
    role: m.role,
    content: m.content,
    status: m.status,
    model: m.model,
    createdAt: m.createdAt.toISOString(),
  };
}

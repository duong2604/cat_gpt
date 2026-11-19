import type { CitationDto, ConversationDto, MessageDto } from '@cat-gpt/shared';
import type { Conversation } from './schemas/conversation.schema.js';
import type { Citation, Message } from './schemas/message.schema.js';

function toCitationDto(c: Citation): CitationDto {
  return {
    n: c.n,
    documentId: c.documentId.toString(),
    documentName: c.documentName,
    chunkIndex: c.chunkIndex,
    ...(c.page !== undefined ? { page: c.page } : {}),
    quote: c.quote,
  };
}

export function toConversationDto(c: Conversation): ConversationDto {
  return {
    id: c._id.toString(),
    title: c.title,
    lastMessageAt: c.lastMessageAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    ...(c.documentIds ? { documentIds: c.documentIds.map((id) => id.toString()) } : {}),
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
    ...(m.citations ? { citations: m.citations.map(toCitationDto) } : {}),
    ...(m.insufficientEvidence !== undefined ? { insufficientEvidence: m.insufficientEvidence } : {}),
    ...(m.ungrounded !== undefined ? { ungrounded: m.ungrounded } : {}),
  };
}

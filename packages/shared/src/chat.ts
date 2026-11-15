import type { ErrorCode } from './error-codes.js';

export const MessageRole = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

/** Trạng thái câu trả lời: hoàn tất, bị người dùng dừng, hoặc LLM lỗi giữa chừng. */
export const MessageStatus = {
  COMPLETED: 'COMPLETED',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const CHAT_MAX_MESSAGE_LENGTH = 4000;
export const CONVERSATION_TITLE_MAX_LENGTH = 100;

export interface ConversationDto {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  model: string | null;
  createdAt: string;
}

/** Phân trang bằng cursor (dùng cho danh sách cuộn vô hạn). */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

/**
 * Sự kiện trong luồng SSE, mỗi sự kiện là một dòng `data: <json>`.
 * Thứ tự: meta → delta (nhiều lần) → done. `error` chỉ xuất hiện khi lỗi ngoài dự kiến.
 */
export type ChatStreamEvent =
  | { type: 'meta'; conversation: ConversationDto; userMessage: MessageDto | null }
  | { type: 'delta'; text: string }
  | { type: 'done'; message: MessageDto }
  | { type: 'error'; code: ErrorCode };

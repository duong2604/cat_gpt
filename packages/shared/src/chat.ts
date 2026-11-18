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
  /** Provider dừng vì chạm giới hạn token đầu ra — giữ phần đã sinh. */
  TRUNCATED: 'TRUNCATED',
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
  /** Tài liệu gắn với hội thoại hỏi–đáp (Module 4) — cố định khi tạo; không có → Chat thường. */
  documentIds?: string[];
}

/** Trích dẫn `[n]` — lấy từ payload Qdrant tại thời điểm trả lời, không do model sinh (thiết kế mục 6.3). */
export interface CitationDto {
  n: number;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  page?: number;
  quote: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  model: string | null;
  createdAt: string;
  /** Chỉ ở tin assistant của hội thoại có `documentIds` (Module 4). */
  citations?: CitationDto[];
  insufficientEvidence?: boolean;
  ungrounded?: boolean;
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

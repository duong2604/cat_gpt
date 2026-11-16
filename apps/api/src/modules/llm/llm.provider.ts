/** Tin nhắn theo định dạng chat chuẩn (OpenAI, Ollama, Gemini, Claude đều ánh xạ được). */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Lý do provider kết thúc bình thường (không tính Dừng / lỗi). */
export type LlmFinishReason = 'completed' | 'max_output_tokens';

export interface LlmStreamOptions {
  /** Bị hủy khi người dùng bấm Dừng hoặc đóng kết nối. */
  signal: AbortSignal;
  /** Provider gọi khi kết thúc bình thường, kèm lý do. */
  onFinish?: (reason: LlmFinishReason) => void;
}

/**
 * Hợp đồng gọi mô hình ngôn ngữ. Code nghiệp vụ chỉ phụ thuộc lớp trừu tượng này.
 *
 * - Hiện tại: MockLlmProvider (chưa có LLM thật).
 * - Sau này: thêm provider Ollama / API và chọn theo biến môi trường, không sửa ChatService.
 */
export abstract class LlmProvider {
  abstract readonly model: string;
  /** `true` khi còn là bản mẫu (chưa gắn LLM thật) — dùng để ẩn Chat ở bản `staff` (CS-6). */
  abstract readonly isMock: boolean;

  /** Trả về từng đoạn văn bản của câu trả lời; phải dừng sớm khi `signal` bị hủy. */
  abstract stream(messages: LlmMessage[], options: LlmStreamOptions): AsyncIterable<string>;
}

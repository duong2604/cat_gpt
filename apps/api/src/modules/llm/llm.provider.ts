/** Tin nhắn theo định dạng chat chuẩn (OpenAI, Ollama, Gemini, Claude đều ánh xạ được). */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmStreamOptions {
  /** Bị hủy khi người dùng bấm Dừng hoặc đóng kết nối. */
  signal: AbortSignal;
}

/**
 * Hợp đồng gọi mô hình ngôn ngữ. Code nghiệp vụ chỉ phụ thuộc lớp trừu tượng này.
 *
 * - Hiện tại: MockLlmProvider (chưa có LLM thật).
 * - Sau này: thêm provider Ollama / API và chọn theo biến môi trường, không sửa ChatService.
 */
export abstract class LlmProvider {
  abstract readonly model: string;

  /** Trả về từng đoạn văn bản của câu trả lời; phải dừng sớm khi `signal` bị hủy. */
  abstract stream(messages: LlmMessage[], options: LlmStreamOptions): AsyncIterable<string>;
}

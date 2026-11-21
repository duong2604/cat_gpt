import { Logger } from '@nestjs/common';
import OpenAI, { APIError, APIUserAbortError } from 'openai';
import { type LlmMessage, LlmProvider, type LlmStreamOptions } from './llm.provider.js';

export interface OpenAiSettings {
  model: string;
  maxOutputTokens: number;
  historyTokenBudget: number;
}

/** Phần của SDK mà provider dùng — để test truyền client giả. */
export type ResponsesClient = Pick<OpenAI, 'responses'>;

/** Lỗi đã làm sạch: chỉ còn mã trạng thái / mã lỗi, không kèm nội dung hội thoại hay key. */
export class LlmError extends Error {
  /** `cause` giữ lỗi gốc cho log chẩn đoán; không đưa ra ngoài và không chứa nội dung hội thoại. */
  constructor(
    readonly status: number | undefined,
    readonly code: string,
    options?: { cause?: unknown },
  ) {
    super(`OpenAI error status=${status ?? '-'} code=${code}`, options);
    this.name = 'LlmError';
  }
}

// ponytail: ước lượng ~3 ký tự/token (tiếng Việt tốn token hơn tiếng Anh); đổi sang tokenizer thật nếu cần chính xác.
const estimateTokens = (text: string) => Math.ceil(text.length / 3);

/**
 * Giữ các tin nhắn gần nhất vừa ngân sách token, giữ thứ tự cũ → mới.
 * Tin nhắn mới nhất (câu hỏi hiện tại) luôn được giữ dù vượt ngân sách.
 */
export function fitHistory(messages: LlmMessage[], budget: number): LlmMessage[] {
  const kept: LlmMessage[] = [];
  let used = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const cost = estimateTokens(messages[i].content);
    if (kept.length > 0 && used + cost > budget) break;
    kept.unshift(messages[i]);
    used += cost;
  }
  return kept;
}

/**
 * OpenAI Responses API, streaming. `store: false` — lịch sử chỉ lưu trong CAT GPT.
 * Bấm Dừng → `signal` hủy cả request HTTP đang stream tới OpenAI.
 */
export class OpenAiLlmProvider extends LlmProvider {
  readonly model: string;
  readonly isMock = false;
  private readonly logger = new Logger(OpenAiLlmProvider.name);

  constructor(
    private readonly settings: OpenAiSettings,
    private readonly client: ResponsesClient,
  ) {
    super();
    this.model = settings.model;
  }

  async *stream(messages: LlmMessage[], { signal, onFinish }: LlmStreamOptions): AsyncIterable<string> {
    const instructions = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');
    const input = fitHistory(
      messages.filter((m) => m.role !== 'system'),
      this.settings.historyTokenBudget,
    ).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      const events = await this.client.responses.create(
        {
          model: this.model,
          instructions: instructions || undefined,
          input,
          max_output_tokens: this.settings.maxOutputTokens,
          store: false,
          stream: true,
        },
        { signal },
      );

      for await (const event of events) {
        switch (event.type) {
          case 'response.output_text.delta':
            yield event.delta;
            break;
          case 'response.completed':
          case 'response.incomplete': {
            const usage = event.response.usage;
            const reason = event.response.incomplete_details?.reason ?? 'completed';
            // Chỉ số liệu, không ghi nội dung hội thoại.
            this.logger.log(
              `usage model=${this.model} input_tokens=${usage?.input_tokens ?? '-'} output_tokens=${usage?.output_tokens ?? '-'} messages=${input.length} end=${reason}`,
            );
            onFinish?.(reason === 'max_output_tokens' ? 'max_output_tokens' : 'completed');
            break;
          }
          case 'response.failed':
            throw new LlmError(undefined, event.response.error?.code ?? 'response_failed');
          case 'error':
            throw new LlmError(undefined, event.code ?? 'stream_error');
        }
      }
    } catch (error) {
      if (error instanceof APIUserAbortError || signal.aborted) return; // Người dùng bấm Dừng.
      if (error instanceof LlmError) throw error;
      if (error instanceof APIError) {
        throw new LlmError(error.status, error.code ?? (error.type as string | undefined) ?? 'api_error');
      }
      throw new LlmError(undefined, 'network_error', { cause: error });
    }
  }
}

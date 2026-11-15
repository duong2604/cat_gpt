import { Injectable } from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';
import { AppConfigService } from '../../config/app-config.service.js';
import { type LlmMessage, LlmProvider, type LlmStreamOptions } from './llm.provider.js';
import { MOCK_ANSWERS } from './mock-answers.js';

/** Câu hỏi chứa chuỗi này → giả lập LLM lỗi giữa chừng (để demo nhánh xử lý lỗi). */
const FAILURE_TRIGGER = '/error';
const QUESTION_PREVIEW_LENGTH = 60;

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * Đầu chờ AI: chọn ngẫu nhiên một câu trả lời mẫu (markdown) và trả về từng đoạn 1–3 từ,
 * mỗi đoạn cách nhau 20–40ms để mô phỏng streaming của LLM thật.
 */
@Injectable()
export class MockLlmProvider extends LlmProvider {
  readonly model: string;

  constructor(config: AppConfigService) {
    super();
    this.model = config.llm.model;
  }

  async *stream(messages: LlmMessage[], { signal }: LlmStreamOptions): AsyncIterable<string> {
    const question = messages.findLast((m) => m.role === 'user')?.content.trim() ?? '';
    const preview =
      question.length > QUESTION_PREVIEW_LENGTH
        ? `${question.slice(0, QUESTION_PREVIEW_LENGTH)}…`
        : question;
    const answer = MOCK_ANSWERS[randomInt(0, MOCK_ANSWERS.length - 1)].replaceAll('{question}', preview);
    const shouldFail = question.includes(FAILURE_TRIGGER);

    // Tách theo khoảng trắng nhưng giữ lại khoảng trắng để ghép lại đúng định dạng markdown.
    const tokens = answer.split(/(\s+)/);
    for (let i = 0, emitted = 0; i < tokens.length; emitted++) {
      if (shouldFail && emitted === 20) throw new Error('Mock LLM failure');

      const size = randomInt(1, 3) * 2;
      yield tokens.slice(i, i + size).join('');
      i += size;

      try {
        await sleep(randomInt(20, 40), undefined, { signal });
      } catch {
        return; // signal bị hủy → dừng sinh câu trả lời.
      }
    }
  }
}

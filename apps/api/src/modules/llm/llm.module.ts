import { Module } from '@nestjs/common';
import { LlmProvider } from './llm.provider.js';
import { MockLlmProvider } from './mock-llm.provider.js';

/** TODO: thêm provider Ollama / API và chọn theo biến môi trường khi có LLM thật. */
@Module({
  providers: [{ provide: LlmProvider, useClass: MockLlmProvider }],
  exports: [LlmProvider],
})
export class LlmModule {}

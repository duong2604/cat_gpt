import { Module } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from '../../config/app-config.service.js';
import { LlmProviderName } from '../../config/env.validation.js';
import { LlmProvider } from './llm.provider.js';
import { MockLlmProvider } from './mock-llm.provider.js';
import { OpenAiLlmProvider } from './openai-llm.provider.js';

/** Chọn provider theo LLM_PROVIDER: `mock` (mặc định, demo/test local) hoặc `openai`. */
@Module({
  providers: [
    {
      provide: LlmProvider,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): LlmProvider => {
        const llm = config.llm;
        if (llm.provider === LlmProviderName.OpenAi) {
          return new OpenAiLlmProvider(llm, new OpenAI({ apiKey: llm.openAiApiKey, maxRetries: 1 }));
        }
        return new MockLlmProvider(config);
      },
    },
  ],
  exports: [LlmProvider],
})
export class LlmModule {}

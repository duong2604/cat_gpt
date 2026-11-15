import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Logger } from '@nestjs/common';
import OpenAI, { RateLimitError } from 'openai';
import { describe, expect, it, vi } from 'vitest';
import { LlmProviderName, validateEnv } from '../../config/env.validation.js';
import type { LlmMessage } from './llm.provider.js';
import { fitHistory, LlmError, OpenAiLlmProvider, type ResponsesClient } from './openai-llm.provider.js';

const settings = { model: 'gpt-5.4-mini', maxOutputTokens: 500, historyTokenBudget: 4000 };
const SECRET_QUESTION = 'Câu hỏi bí mật về lương';

function fakeClient(events: () => AsyncIterable<unknown>) {
  const create = vi.fn(async (_body: unknown, _opts: { signal: AbortSignal }) => events());
  return { client: { responses: { create } } as unknown as ResponsesClient, create };
}

async function collect(it: AsyncIterable<string>) {
  const out: string[] = [];
  for await (const c of it) out.push(c);
  return out;
}

const messages: LlmMessage[] = [
  { role: 'system', content: 'Bạn là CAT GPT.' },
  { role: 'user', content: 'Xin chào' },
  { role: 'assistant', content: 'Chào bạn' },
  { role: 'user', content: SECRET_QUESTION },
];

describe('fitHistory', () => {
  it('giữ tin mới nhất vừa ngân sách, đúng thứ tự', () => {
    const msgs: LlmMessage[] = ['a'.repeat(300), 'b'.repeat(300), 'c'.repeat(300)].map((content) => ({
      role: 'user',
      content,
    }));
    expect(fitHistory(msgs, 200).map((m) => m.content[0])).toEqual(['b', 'c']);
  });
  it('luôn giữ câu hỏi hiện tại dù vượt ngân sách', () => {
    expect(fitHistory([{ role: 'user', content: 'x'.repeat(10_000) }], 500)).toHaveLength(1);
  });
});

describe('OpenAiLlmProvider', () => {
  it('stream delta, store:false, max_output_tokens, instructions; log usage không chứa nội dung', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const { client, create } = fakeClient(async function* () {
      yield { type: 'response.output_text.delta', delta: 'Xin ' };
      yield { type: 'response.output_text.delta', delta: 'chào' };
      yield {
        type: 'response.completed',
        response: { usage: { input_tokens: 42, output_tokens: 7 }, incomplete_details: null },
      };
    });
    const signal = new AbortController().signal;
    const out = await collect(new OpenAiLlmProvider(settings, client).stream(messages, { signal }));

    expect(out.join('')).toBe('Xin chào');
    const [body, opts] = create.mock.calls[0];
    expect(body).toMatchObject({
      model: 'gpt-5.4-mini',
      store: false,
      stream: true,
      max_output_tokens: 500,
      instructions: 'Bạn là CAT GPT.',
    });
    expect((body as { input: unknown[] }).input).toHaveLength(3);
    expect(opts.signal).toBe(signal);
    const logged = log.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toContain('input_tokens=42 output_tokens=7');
    expect(logged).not.toContain(SECRET_QUESTION);
    log.mockRestore();
  });

  it('Dừng: hủy signal → kết thúc êm, không ném lỗi', async () => {
    const controller = new AbortController();
    const { client } = fakeClient(async function* () {
      yield { type: 'response.output_text.delta', delta: 'một phần' };
      controller.abort();
      throw new Error('Request was aborted.');
    });
    const out = await collect(
      new OpenAiLlmProvider(settings, client).stream(messages, { signal: controller.signal }),
    );
    expect(out).toEqual(['một phần']);
  });

  it('hết hạn mức (429 insufficient_quota) → LlmError đã làm sạch', async () => {
    const { client } = fakeClient(() => {
      throw new RateLimitError(
        429,
        { code: 'insufficient_quota', message: 'You exceeded your current quota' },
        'quota',
        new Headers(),
      );
    });
    const err = await collect(
      new OpenAiLlmProvider(settings, client).stream(messages, { signal: new AbortController().signal }),
    ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(LlmError);
    expect(err).toMatchObject({ status: 429, code: 'insufficient_quota' });
    expect(String((err as Error).message)).not.toContain(SECRET_QUESTION);
  });

  it('response.failed → LlmError', async () => {
    const { client } = fakeClient(async function* () {
      yield { type: 'response.failed', response: { error: { code: 'server_error' } } };
    });
    await expect(
      collect(new OpenAiLlmProvider(settings, client).stream(messages, { signal: new AbortController().signal })),
    ).rejects.toMatchObject({ code: 'server_error' });
  });
});

describe('validateEnv — LLM', () => {
  const base = {
    MONGODB_URI: 'mongodb://localhost/x',
    JWT_ACCESS_SECRET: 'a'.repeat(32),
    JWT_REFRESH_SECRET: 'b'.repeat(32),
    ADMIN_EMAIL: 'admin@catgpt.local',
    ADMIN_PASSWORD: 'Admin@123',
  };
  it('mặc định mock, không cần key', () => {
    expect(validateEnv(base).LLM_PROVIDER).toBe(LlmProviderName.Mock);
  });
  it('openai thiếu key → lỗi rõ', () => {
    expect(() => validateEnv({ ...base, LLM_PROVIDER: 'openai' })).toThrow(/OPENAI_API_KEY/);
  });
  it('openai có key → hợp lệ, LLM_MAX_OUTPUT_TOKENS mặc định 1000 (O1), cấu hình được', () => {
    expect(validateEnv({ ...base, LLM_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-test' }).LLM_MAX_OUTPUT_TOKENS).toBe(1000);
    expect(validateEnv({ ...base, LLM_MAX_OUTPUT_TOKENS: '1500' }).LLM_MAX_OUTPUT_TOKENS).toBe(1500);
  });
});

describe('OpenAiLlmProvider — lý do kết thúc', () => {
  const run = async (finalEvent: unknown) => {
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const { client } = fakeClient(async function* () {
      yield { type: 'response.output_text.delta', delta: 'abc' };
      yield finalEvent;
    });
    const onFinish = vi.fn();
    const out = await collect(
      new OpenAiLlmProvider(settings, client).stream(messages, { signal: new AbortController().signal, onFinish }),
    );
    return { out, onFinish };
  };
  it('hoàn tất → onFinish("completed")', async () => {
    const { onFinish } = await run({ type: 'response.completed', response: { usage: null, incomplete_details: null } });
    expect(onFinish).toHaveBeenCalledWith('completed');
  });
  it('chạm giới hạn → giữ phần đã sinh, onFinish("max_output_tokens")', async () => {
    const { out, onFinish } = await run({
      type: 'response.incomplete',
      response: { usage: null, incomplete_details: { reason: 'max_output_tokens' } },
    });
    expect(out.join('')).toBe('abc');
    expect(onFinish).toHaveBeenCalledWith('max_output_tokens');
  });
});

describe('OpenAiLlmProvider — Dừng cắt kết nối tới provider (SDK thật + server SSE cục bộ)', () => {
  it('hủy signal → server nhận đóng kết nối, không chờ hết câu trả lời', async () => {
    let closedAt = 0;
    let sent = 0;
    const server: Server = createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const timer = setInterval(() => {
        sent++;
        res.write(`event: response.output_text.delta
data: ${JSON.stringify({ type: 'response.output_text.delta', delta: 'x', sequence_number: sent })}

`);
        if (sent >= 200) { clearInterval(timer); res.end(); }
      }, 20);
      req.on('close', () => { clearInterval(timer); closedAt = Date.now(); });
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const { port } = server.address() as AddressInfo;
    const client = new OpenAI({ apiKey: 'sk-test', baseURL: `http://127.0.0.1:${port}/v1`, maxRetries: 0 });
    const controller = new AbortController();
    const provider = new OpenAiLlmProvider(settings, client);

    let received = 0;
    const abortedAt = await (async () => {
      for await (const _ of provider.stream(messages, { signal: controller.signal })) {
        if (++received === 5) { controller.abort(); return Date.now(); }
      }
      return 0;
    })();
    await new Promise((r) => setTimeout(r, 300));
    server.close();

    expect(abortedAt).toBeGreaterThan(0);
    expect(closedAt).toBeGreaterThan(0);
    expect(closedAt - abortedAt).toBeLessThan(300);
    expect(sent).toBeLessThan(50); // server ngừng gửi ngay, không chạy tới 200
  });
});

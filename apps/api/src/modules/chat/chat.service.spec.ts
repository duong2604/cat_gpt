import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorCode, MessageRole, MessageStatus } from '@cat-gpt/shared';
import type { AppConfigService } from '../../config/app-config.service.js';
import type { DocumentEntity } from '../documents/schemas/document.schema.js';
import { type LlmFinishReason, type LlmMessage, LlmProvider, type LlmStreamOptions } from '../llm/llm.provider.js';
import { ChatService, makeTitle } from './chat.service.js';
import type { CreateMessageInput } from './conversations.service.js';
import type { ConversationsService } from './conversations.service.js';
import type { Conversation } from './schemas/conversation.schema.js';
import type { Message } from './schemas/message.schema.js';
import type { SseStream } from './sse-stream.js';

/**
 * Hồi quy cho ChatService.streamAnswer (chưa có test trước SE-014 — ghi chú tích hợp TL
 * 18/11/2026). Phải xanh trên code CHƯA sửa, rồi trên code RagService mới, để chứng minh
 * đường ống Chat thường không đổi hành vi (AC4, thiết kế mục 3.1 "ngược lại: như hiện tại").
 */

const USER_ID = new Types.ObjectId();

function fakeConfig(systemPrompt = 'Bạn là trợ lý nội bộ.'): AppConfigService {
  return { llm: { systemPrompt } } as unknown as AppConfigService;
}

/** Bản thay thế trong bộ nhớ của ConversationsService — đủ hành vi để kiểm ChatService, không chạm Mongo thật. */
class FakeConversationsService {
  conversations = new Map<string, Conversation>();
  messages = new Map<string, Message>();

  async getOwnedOrThrow(userId: string, id: string): Promise<Conversation> {
    const c = this.conversations.get(id);
    if (!c || c.userId.toString() !== userId) {
      const { AppException } = await import('../../common/exceptions/app.exception.js');
      throw AppException.notFound(ErrorCode.CONVERSATION_NOT_FOUND);
    }
    return c;
  }

  async create(userId: string, title: string): Promise<Conversation> {
    const now = new Date();
    const c = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      title,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    } as Conversation;
    this.conversations.set(c._id.toString(), c);
    return c;
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
    const m = {
      _id: new Types.ObjectId(),
      conversationId: input.conversationId,
      userId: input.userId,
      role: input.role,
      content: input.content,
      status: input.status ?? MessageStatus.COMPLETED,
      model: input.model ?? null,
      createdAt: new Date(),
    } as Message;
    this.messages.set(m._id.toString(), m);
    return m;
  }

  async touch(id: Types.ObjectId): Promise<boolean> {
    const c = this.conversations.get(id.toString());
    if (!c) return false;
    c.lastMessageAt = new Date();
    return true;
  }

  async exists(id: Types.ObjectId): Promise<boolean> {
    return this.conversations.has(id.toString());
  }

  private messagesFor(conversationId: Types.ObjectId): Message[] {
    return [...this.messages.values()]
      .filter((m) => m.conversationId.toString() === conversationId.toString())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async recentMessages(conversationId: Types.ObjectId, limit: number): Promise<Message[]> {
    return this.messagesFor(conversationId).slice(-limit);
  }

  async lastMessage(conversationId: Types.ObjectId): Promise<Message | null> {
    const list = this.messagesFor(conversationId);
    return list.length ? list[list.length - 1] : null;
  }

  async deleteMessage(id: Types.ObjectId): Promise<void> {
    this.messages.delete(id.toString());
  }
}

/** Ghi lại các sự kiện SSE theo đúng thứ tự gửi, không chạm Express thật. */
class RecordingSse {
  events: unknown[] = [];
  private onClientClose?: () => void;
  ended = false;

  open(onClientClose: () => void): void {
    this.onClientClose = onClientClose;
  }

  send(event: unknown): void {
    this.events.push(event);
  }

  end(): void {
    this.ended = true;
  }

  /** Mô phỏng người dùng đóng tab/mất mạng giữa chừng. */
  simulateClientClose(): void {
    this.onClientClose?.();
  }
}

function sleep(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Provider LLM dựng sẵn cho test: phát từng đoạn trong `chunks`, sau mỗi đoạn nhường một
 * macrotask (`setTimeout`) rồi mới kiểm `signal.aborted` — nhường macrotask (không chỉ
 * microtask) để một lệnh `stop()` được gọi xen giữa (chỉ toàn microtask) chắc chắn đã
 * chạy xong trước khi kiểm, không phụ thuộc số lượt microtask chính xác.
 */
class ScriptedLlmProvider extends LlmProvider {
  readonly model = 'test-model';
  readonly isMock = true;
  capturedSignal?: AbortSignal;
  /** Test gán để biết chính xác lúc nào một đoạn vừa được gửi qua SSE. */
  onChunkSent?: () => void;

  constructor(
    private readonly chunks: string[],
    private readonly opts: { finishReason?: LlmFinishReason; error?: Error } = {},
  ) {
    super();
  }

  async *stream(_messages: LlmMessage[], options: LlmStreamOptions): AsyncIterable<string> {
    this.capturedSignal = options.signal;
    for (const chunk of this.chunks) {
      yield chunk;
      this.onChunkSent?.();
      await sleep(0);
      if (options.signal.aborted) return;
    }
    if (this.opts.error) throw this.opts.error;
    if (this.opts.finishReason) options.onFinish?.(this.opts.finishReason);
  }
}

function makeService(llm: LlmProvider, conversations = new FakeConversationsService()) {
  // Không có test nào ở đây dùng documentIds — model tài liệu không bao giờ được gọi tới.
  const fakeDocumentModel = {} as unknown as Model<DocumentEntity>;
  const service = new ChatService(
    conversations as unknown as ConversationsService,
    llm,
    fakeConfig(),
    fakeDocumentModel,
  );
  return { service, conversations };
}

describe('ChatService — hồi quy (trước khi thêm RagService, SE-014)', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('thứ tự sự kiện SSE và 4 trạng thái kết thúc', () => {
    it('COMPLETED: sinh xong bình thường — meta → delta* → done, status COMPLETED', async () => {
      const llm = new ScriptedLlmProvider(['Xin ', 'chào']);
      const { service, conversations } = makeService(llm);
      const sse = new RecordingSse();

      await service.send(USER_ID.toString(), { content: 'Chào bạn' }, sse as unknown as SseStream);

      expect(sse.events.map((e) => (e as { type: string }).type)).toEqual([
        'meta',
        'delta',
        'delta',
        'done',
      ]);
      const done = sse.events.at(-1) as { type: 'done'; message: { status: string; content: string } };
      expect(done.message.status).toBe(MessageStatus.COMPLETED);
      expect(done.message.content).toBe('Xin chào');
      expect(sse.ended).toBe(true);

      const saved = [...conversations.messages.values()];
      expect(saved).toHaveLength(2); // user + assistant
      expect(saved[1].status).toBe(MessageStatus.COMPLETED);
    });

    it('TRUNCATED: provider báo hết token đầu ra — giữ nội dung đã sinh, status TRUNCATED', async () => {
      const llm = new ScriptedLlmProvider(['Phần đầu'], { finishReason: 'max_output_tokens' });
      const { service } = makeService(llm);
      const sse = new RecordingSse();

      await service.send(USER_ID.toString(), { content: 'Câu hỏi dài' }, sse as unknown as SseStream);

      const done = sse.events.at(-1) as { type: 'done'; message: { status: string; content: string } };
      expect(done.message.status).toBe(MessageStatus.TRUNCATED);
      expect(done.message.content).toBe('Phần đầu');
    });

    it('ERROR: provider ném lỗi (không phải Dừng) — lưu phần đã sinh, status ERROR', async () => {
      const llm = new ScriptedLlmProvider(['Đang trả lời'], { error: new Error('LLM 500') });
      const { service } = makeService(llm);
      const sse = new RecordingSse();

      await service.send(USER_ID.toString(), { content: 'Câu hỏi' }, sse as unknown as SseStream);

      expect(sse.events.map((e) => (e as { type: string }).type)).toEqual(['meta', 'delta', 'done']);
      const done = sse.events.at(-1) as { type: 'done'; message: { status: string; content: string } };
      expect(done.message.status).toBe(MessageStatus.ERROR);
      expect(done.message.content).toBe('Đang trả lời');
    });

    it('STOPPED: gọi stop() giữa chừng — giữ phần đã sinh tới lúc đó, status STOPPED', async () => {
      const llm = new ScriptedLlmProvider(['Chunk1', 'Chunk2', 'Chunk3']);
      const { service, conversations } = makeService(llm);
      const sse = new RecordingSse();

      let conversationId = '';
      let resolveFirstChunk!: () => void;
      const firstChunkSent = new Promise<void>((resolve) => {
        resolveFirstChunk = resolve;
      });
      llm.onChunkSent = () => resolveFirstChunk();

      const sendPromise = service.send(USER_ID.toString(), { content: 'Kể chuyện dài' }, sse as unknown as SseStream);
      await firstChunkSent;
      conversationId = (sse.events[0] as { conversation: { id: string } }).conversation.id;

      await service.stop(USER_ID.toString(), conversationId);
      await sendPromise;

      const done = sse.events.at(-1) as { type: 'done'; message: { status: string; content: string } };
      expect(done.message.status).toBe(MessageStatus.STOPPED);
      expect(done.message.content).toBe('Chunk1');
      const saved = [...conversations.messages.values()];
      expect(saved[1].status).toBe(MessageStatus.STOPPED);
    });

    it('đóng tab/mất mạng giữa chừng cũng tạo ra STOPPED (SseStream.open gọi onClientClose)', async () => {
      const llm = new ScriptedLlmProvider(['Chunk1', 'Chunk2']);
      const { service } = makeService(llm);
      const sse = new RecordingSse();

      let resolveFirstChunk!: () => void;
      const firstChunkSent = new Promise<void>((resolve) => {
        resolveFirstChunk = resolve;
      });
      llm.onChunkSent = () => resolveFirstChunk();

      const sendPromise = service.send(USER_ID.toString(), { content: 'Hỏi' }, sse as unknown as SseStream);
      await firstChunkSent;
      sse.simulateClientClose();
      await sendPromise;

      const done = sse.events.at(-1) as { type: 'done'; message: { status: string } };
      expect(done.message.status).toBe(MessageStatus.STOPPED);
    });
  });

  describe('Tạo lại (regenerate)', () => {
    it('xóa câu trả lời cuối rồi sinh lại cho cùng câu hỏi, giữ nguyên thứ tự SSE', async () => {
      const llm = new ScriptedLlmProvider(['Trả lời lần 1']);
      const { service, conversations } = makeService(llm);
      const sse1 = new RecordingSse();
      await service.send(USER_ID.toString(), { content: 'Câu hỏi' }, sse1 as unknown as SseStream);
      const conversationId = (sse1.events[0] as { conversation: { id: string } }).conversation.id;
      expect([...conversations.messages.values()]).toHaveLength(2);

      const llm2 = new ScriptedLlmProvider(['Trả lời lần 2 (tạo lại)']);
      const { service: service2 } = makeService(llm2, conversations);
      const sse2 = new RecordingSse();
      await service2.regenerate(USER_ID.toString(), conversationId, sse2 as unknown as SseStream);

      expect(sse2.events.map((e) => (e as { type: string }).type)).toEqual(['meta', 'delta', 'done']);
      // meta của regenerate không có userMessage mới (sinh lại cho câu hỏi cũ).
      expect((sse2.events[0] as { userMessage: unknown }).userMessage).toBeNull();

      const saved = [...conversations.messages.values()].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      expect(saved).toHaveLength(2); // câu trả lời cũ bị xóa, chỉ còn user + assistant mới
      expect(saved[0].role).toBe(MessageRole.USER);
      expect(saved[1].content).toBe('Trả lời lần 2 (tạo lại)');
    });

    it('không có câu hỏi nào để tạo lại → CHAT_NOTHING_TO_REGENERATE, không gọi LLM', async () => {
      const llm = new ScriptedLlmProvider(['không nên gọi tới']);
      const { service, conversations } = makeService(llm);
      const conversation = await conversations.create(USER_ID.toString(), 'Trống');

      await expect(
        service.regenerate(USER_ID.toString(), conversation._id.toString(), new RecordingSse() as unknown as SseStream),
      ).rejects.toMatchObject({ code: ErrorCode.CHAT_NOTHING_TO_REGENERATE });
    });
  });

  it('makeTitle: cắt khoảng 50 ký tự ở ranh giới từ', () => {
    const long = 'Đây là một câu hỏi rất dài để kiểm tra việc cắt tiêu đề hội thoại cho đúng ranh giới từ';
    const title = makeTitle(long);
    expect(title.length).toBeLessThanOrEqual(51); // + dấu "…"
    expect(title.endsWith('…')).toBe(true);
  });
});

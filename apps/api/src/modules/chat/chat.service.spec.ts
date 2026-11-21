import type { Model } from 'mongoose';
import type { Queue } from 'bullmq';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorCode, MessageRole, MessageStatus } from '@cat-gpt/shared';
import type { AppConfigService } from '../../config/app-config.service.js';
import { ReleaseMode } from '../../config/env.validation.js';
import type { DocumentFilesService } from '../documents/document-files.service.js';
import { DocumentsService } from '../documents/documents.service.js';
import type { DocumentEntity } from '../documents/schemas/document.schema.js';
import { type LlmFinishReason, type LlmMessage, LlmProvider, type LlmStreamOptions } from '../llm/llm.provider.js';
import { RAG_REFUSAL_TEXT } from '../rag/rag-prompt.js';
import type { RagService } from '../rag/rag.service.js';
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

function fakeConfig(
  systemPrompt = 'Bạn là trợ lý nội bộ.',
  maxDocuments = 5,
  releaseMode?: ReleaseMode,
): AppConfigService {
  return { llm: { systemPrompt }, rag: { maxDocuments }, releaseMode } as unknown as AppConfigService;
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

  async create(userId: string, title: string, documentIds?: Types.ObjectId[]): Promise<Conversation> {
    const now = new Date();
    const c = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      title,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
      ...(documentIds ? { documentIds } : {}),
    } as Conversation;
    this.conversations.set(c._id.toString(), c);
    return c;
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
    const m = {
      ...input,
      _id: new Types.ObjectId(),
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

function makeService(
  llm: LlmProvider,
  conversations = new FakeConversationsService(),
  documentModel: Model<DocumentEntity> = {} as unknown as Model<DocumentEntity>,
  config: AppConfigService = fakeConfig(),
  // Mặc định: không có test nào ở đây đặt conversation.documentIds nên RagService không
  // bao giờ được gọi tới — stub rỗng để lộ ngay lỗi gọi nhầm thay vì âm thầm bỏ qua.
  rag: RagService = {} as unknown as RagService,
) {
  // DocumentsService thật, chỉ thay Model bằng bản trong bộ nhớ (kiểm 404/400 đúng code thật).
  const documents = new DocumentsService(
    documentModel,
    {} as unknown as Queue,
    {} as unknown as DocumentFilesService,
    {} as unknown as AppConfigService,
  );
  const service = new ChatService(
    conversations as unknown as ConversationsService,
    llm,
    config,
    documents,
    rag,
  );
  return { service, conversations };
}

interface FakeDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: string;
  deletedAt: Date | null;
}

/** Bản thay thế trong bộ nhớ của Model<DocumentEntity> — chỉ cần đúng chuỗi gọi `.find(...).lean().exec()`. */
function fakeDocumentModel(docs: FakeDoc[]): Model<DocumentEntity> {
  return {
    find(filter: { _id: { $in: Types.ObjectId[] }; userId: Types.ObjectId; deletedAt: null }) {
      const ids = filter._id.$in.map((id) => id.toString());
      const matches = docs.filter(
        (d) =>
          ids.includes(d._id.toString()) &&
          d.userId.toString() === filter.userId.toString() &&
          d.deletedAt === filter.deletedAt,
      );
      return { lean: () => ({ exec: async () => matches }) };
    },
  } as unknown as Model<DocumentEntity>;
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

  describe('Validation documentIds khi tạo hội thoại (thiết kế mục 5, TL review CP1)', () => {
    const OTHER_USER_ID = new Types.ObjectId();

    it('conversationId kèm documentIds → 400 VALIDATION_FAILED, không gọi LLM', async () => {
      const llm = new ScriptedLlmProvider(['không nên gọi tới']);
      const { service, conversations } = makeService(llm);
      const conversation = await conversations.create(USER_ID.toString(), 'Hội thoại có sẵn');

      await expect(
        service.send(
          USER_ID.toString(),
          { conversationId: conversation._id.toString(), content: 'x', documentIds: [new Types.ObjectId().toString()] },
          new RecordingSse() as unknown as SseStream,
        ),
      ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    });

    it('documentIds của người khác (R4) → 404 DOCUMENT_NOT_FOUND, không phân biệt lý do', async () => {
      const otherUsersDoc = { _id: new Types.ObjectId(), userId: OTHER_USER_ID, status: 'READY', deletedAt: null };
      const { service } = makeService(new ScriptedLlmProvider([]), undefined, fakeDocumentModel([otherUsersDoc]));

      await expect(
        service.send(
          USER_ID.toString(),
          { content: 'Hỏi tài liệu của người khác', documentIds: [otherUsersDoc._id.toString()] },
          new RecordingSse() as unknown as SseStream,
        ),
      ).rejects.toMatchObject({ code: ErrorCode.DOCUMENT_NOT_FOUND });
    });

    it('tài liệu chưa READY (R5) → 400 DOCUMENT_NOT_READY', async () => {
      const processingDoc = { _id: new Types.ObjectId(), userId: USER_ID, status: 'PROCESSING', deletedAt: null };
      const { service } = makeService(new ScriptedLlmProvider([]), undefined, fakeDocumentModel([processingDoc]));

      await expect(
        service.send(
          USER_ID.toString(),
          { content: 'Hỏi khi đang xử lý', documentIds: [processingDoc._id.toString()] },
          new RecordingSse() as unknown as SseStream,
        ),
      ).rejects.toMatchObject({ code: ErrorCode.DOCUMENT_NOT_READY });
    });

    it('vượt RAG_MAX_DOCUMENTS → 400 VALIDATION_FAILED, không gọi Mongo', async () => {
      const findSpy = vi.fn();
      const model = { find: findSpy } as unknown as Model<DocumentEntity>;
      const { service } = makeService(new ScriptedLlmProvider([]), undefined, model, fakeConfig(undefined, 2));

      await expect(
        service.send(
          USER_ID.toString(),
          {
            content: 'Chọn quá nhiều tài liệu',
            documentIds: [new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString()],
          },
          new RecordingSse() as unknown as SseStream,
        ),
      ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
      expect(findSpy).not.toHaveBeenCalled();
    });

    it('bản staff ẩn luôn việc tiếp tục hội thoại hỏi tài liệu đã có từ trước (không chỉ lúc tạo)', async () => {
      const conversations = new FakeConversationsService();
      const myDoc = { _id: new Types.ObjectId(), userId: USER_ID, status: 'READY', deletedAt: null };
      // Hội thoại được tạo trước đó (ví dụ lúc còn ở bản demo) đã có documentIds.
      const conversation = await conversations.create(USER_ID.toString(), 'Hội thoại cũ', [myDoc._id]);
      const staffConfig = fakeConfig(undefined, 5, ReleaseMode.Staff);
      const { service } = makeService(new ScriptedLlmProvider([]), conversations, fakeDocumentModel([myDoc]), staffConfig);

      await expect(
        service.send(
          USER_ID.toString(),
          { conversationId: conversation._id.toString(), content: 'Hỏi tiếp' },
          new RecordingSse() as unknown as SseStream,
        ),
      ).rejects.toMatchObject({ code: ErrorCode.DOCUMENT_NOT_FOUND });

      await expect(
        service.regenerate(USER_ID.toString(), conversation._id.toString(), new RecordingSse() as unknown as SseStream),
      ).rejects.toMatchObject({ code: ErrorCode.DOCUMENT_NOT_FOUND });
    });

    it('bản staff KHÔNG ảnh hưởng Chat thường (không documentIds) khi tiếp tục hội thoại', async () => {
      const conversations = new FakeConversationsService();
      const conversation = await conversations.create(USER_ID.toString(), 'Chat thường');
      await conversations.createMessage({
        conversationId: conversation._id,
        userId: conversation.userId,
        role: MessageRole.USER,
        content: 'Câu đầu',
      });
      const staffConfig = fakeConfig(undefined, 5, ReleaseMode.Staff);
      const { service } = makeService(new ScriptedLlmProvider(['Vẫn trả lời bình thường']), conversations, undefined, staffConfig);
      const sse = new RecordingSse();

      await service.send(
        USER_ID.toString(),
        { conversationId: conversation._id.toString(), content: 'Hỏi tiếp' },
        sse as unknown as SseStream,
      );

      const done = sse.events.at(-1) as { type: 'done'; message: { status: string } };
      expect(done.message.status).toBe(MessageStatus.COMPLETED);
    });

    it('tài liệu hợp lệ, READY, cùng chủ → tạo hội thoại thành công, lưu documentIds', async () => {
      const myDoc = { _id: new Types.ObjectId(), userId: USER_ID, status: 'READY', deletedAt: null };
      const source = { documentId: myDoc._id.toString(), documentName: 'Tài liệu của tôi', chunkIndex: 0, text: 'Nội dung đoạn.' };
      // Fake RagService tối thiểu để kiểm ChatService nối đúng prepare() → LLM →
      // verifyCitations() → lưu — không lặp lại logic đã kiểm trong rag.service.spec.ts.
      const fakeRag = {
        prepare: async () => ({ kind: 'ready' as const, systemPrompt: 'system prompt', sources: [source] }),
        verifyCitations: () => ({
          citations: [{ n: 1, documentId: source.documentId, documentName: source.documentName, chunkIndex: 0, quote: source.text }],
          insufficientEvidence: false,
          ungrounded: false,
        }),
      } as unknown as RagService;
      const { service, conversations } = makeService(
        new ScriptedLlmProvider(['Trả lời có căn cứ [1].']),
        undefined,
        fakeDocumentModel([myDoc]),
        fakeConfig(),
        fakeRag,
      );
      const sse = new RecordingSse();

      await service.send(
        USER_ID.toString(),
        { content: 'Hỏi tài liệu của tôi', documentIds: [myDoc._id.toString()] },
        sse as unknown as SseStream,
      );

      const meta = sse.events[0] as { conversation: { documentIds?: string[] } };
      expect(meta.conversation.documentIds).toEqual([myDoc._id.toString()]);
      expect([...conversations.conversations.values()][0].documentIds).toEqual([myDoc._id]);

      const done = sse.events.at(-1) as { type: 'done'; message: { content: string; citations: unknown[] } };
      expect(done.message.content).toBe('Trả lời có căn cứ [1].');
      expect(done.message.citations).toHaveLength(1);
    });

    it('insufficient → gửi câu từ chối, KHÔNG gọi LLM (AC2: không dòng log usage)', async () => {
      const myDoc = { _id: new Types.ObjectId(), userId: USER_ID, status: 'READY', deletedAt: null };
      const llm = new ScriptedLlmProvider(['KHÔNG được gọi tới']);
      const streamSpy = vi.spyOn(llm, 'stream');
      const fakeRag = {
        prepare: async () => ({ kind: 'insufficient' as const, reason: 'NO_MATCH' as const }),
      } as unknown as RagService;
      const { service } = makeService(llm, undefined, fakeDocumentModel([myDoc]), fakeConfig(), fakeRag);
      const sse = new RecordingSse();

      await service.send(
        USER_ID.toString(),
        { content: 'Câu hỏi ngoài tài liệu', documentIds: [myDoc._id.toString()] },
        sse as unknown as SseStream,
      );

      expect(streamSpy).not.toHaveBeenCalled();
      expect(sse.events.map((e) => (e as { type: string }).type)).toEqual(['meta', 'delta', 'done']);
      const done = sse.events.at(-1) as { type: 'done'; message: { content: string; insufficientEvidence: boolean; citations: unknown[] } };
      expect(done.message.content).toBe(RAG_REFUSAL_TEXT);
      expect(done.message.insufficientEvidence).toBe(true);
      expect(done.message.citations).toEqual([]);
    });

    it('prepare lỗi (embed/Qdrant, R8) → lưu tin ERROR, không gọi LLM, done; Tạo lại được khi truy hồi OK', async () => {
      const myDoc = { _id: new Types.ObjectId(), userId: USER_ID, status: 'READY', deletedAt: null };
      const source = { documentId: myDoc._id.toString(), documentName: 'Tài liệu của tôi', chunkIndex: 0, text: 'Nội dung đoạn.' };
      let qdrantDown = true;
      const fakeRag = {
        prepare: async () => {
          if (qdrantDown) throw new Error('qdrant unreachable');
          return { kind: 'ready' as const, systemPrompt: 'system prompt', sources: [source] };
        },
        verifyCitations: () => ({
          citations: [{ n: 1, documentId: source.documentId, documentName: source.documentName, chunkIndex: 0, quote: source.text }],
          insufficientEvidence: false,
          ungrounded: false,
        }),
      } as unknown as RagService;
      const llm = new ScriptedLlmProvider(['Trả lời có căn cứ [1].']);
      const streamSpy = vi.spyOn(llm, 'stream');
      const { service, conversations } = makeService(llm, undefined, fakeDocumentModel([myDoc]), fakeConfig(), fakeRag);
      const sse = new RecordingSse();

      await service.send(
        USER_ID.toString(),
        { content: 'Hỏi tài liệu của tôi', documentIds: [myDoc._id.toString()] },
        sse as unknown as SseStream,
      );

      expect(streamSpy).not.toHaveBeenCalled();
      const failed = sse.events.at(-1) as { type: 'done'; message: { status: string; citations: unknown[] } };
      expect(failed.type).toBe('done');
      expect(failed.message.status).toBe(MessageStatus.ERROR);
      expect(failed.message.citations ?? []).toEqual([]);

      qdrantDown = false;
      const conversation = [...conversations.conversations.values()][0];
      const sse2 = new RecordingSse();
      await service.regenerate(USER_ID.toString(), conversation._id.toString(), sse2 as unknown as SseStream);

      const retried = sse2.events.at(-1) as { type: 'done'; message: { status: string; content: string } };
      expect(retried.message.status).toBe(MessageStatus.COMPLETED);
      expect(retried.message.content).toBe('Trả lời có căn cứ [1].');
    });
  });

  it('makeTitle: cắt khoảng 50 ký tự ở ranh giới từ', () => {
    const long = 'Đây là một câu hỏi rất dài để kiểm tra việc cắt tiêu đề hội thoại cho đúng ranh giới từ';
    const title = makeTitle(long);
    expect(title.length).toBeLessThanOrEqual(51); // + dấu "…"
    expect(title.endsWith('…')).toBe(true);
  });
});

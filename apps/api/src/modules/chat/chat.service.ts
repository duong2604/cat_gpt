import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ErrorCode, MessageRole, MessageStatus } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { isDocumentsHidden } from '../documents/documents-hidden.guard.js';
import { DocumentsService } from '../documents/documents.service.js';
import { type LlmFinishReason, type LlmMessage, LlmProvider } from '../llm/llm.provider.js';
import { RAG_REFUSAL_TEXT } from '../rag/rag-prompt.js';
import type { RagPlan } from '../rag/rag.service.js';
import { RagService } from '../rag/rag.service.js';
import { toConversationDto, toMessageDto } from './chat.presenter.js';
import { type CreateMessageInput, ConversationsService } from './conversations.service.js';
import type { SendMessageDto } from './dto/chat.dto.js';
import type { Conversation } from './schemas/conversation.schema.js';
import type { Message } from './schemas/message.schema.js';
import type { SseStream } from './sse-stream.js';

/** Số tin nhắn gần nhất gửi kèm làm ngữ cảnh cho LLM. */
const CONTEXT_MESSAGES = 20;
const TITLE_LENGTH = 50;

const LLM_ROLE: Record<MessageRole, LlmMessage['role']> = {
  [MessageRole.USER]: 'user',
  [MessageRole.ASSISTANT]: 'assistant',
};

/** Tiêu đề = khoảng 50 ký tự đầu của tin nhắn đầu tiên, cắt ở ranh giới từ. */
export function makeTitle(content: string): string {
  const text = content.replace(/\s+/g, ' ').trim();
  if (text.length <= TITLE_LENGTH) return text;
  const cut = text.slice(0, TITLE_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${lastSpace > TITLE_LENGTH / 2 ? cut.slice(0, lastSpace) : cut}…`;
}

/**
 * Ghép tin nhắn gửi LLM: prompt hệ thống, prompt RAG (nếu truy hồi sẵn sàng), rồi lịch sử.
 */
export function buildLlmMessages(systemPrompt: string, plan: RagPlan | null, history: Message[]): LlmMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    // Prompt RAG là tin system thứ hai, đặt sau.
    ...(plan?.kind === 'ready' ? [{ role: 'system' as const, content: plan.systemPrompt }] : []),
    ...history
      .filter((m) => m.content.trim())
      .map((m) => ({ role: LLM_ROLE[m.role], content: m.content })),
  ];
}

/**
 * Gửi tin nhắn và stream câu trả lời của LLM qua SSE.
 * Câu trả lời được gom trong bộ nhớ và lưu một lần khi kết thúc (hoàn tất / dừng / lỗi).
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  // ponytail: lưu trong bộ nhớ của một tiến trình API; chạy nhiều instance thì chuyển sang Redis.
  /** Hội thoại đang stream → bộ điều khiển hủy (dùng cho nút Dừng và chặn stream song song). */
  private readonly inFlight = new Map<string, AbortController>();

  constructor(
    private readonly conversations: ConversationsService,
    private readonly llm: LlmProvider,
    private readonly config: AppConfigService,
    private readonly documents: DocumentsService,
    private readonly rag: RagService,
  ) {}

  async send(userId: string, dto: SendMessageDto, sse: SseStream): Promise<void> {
    let conversation: Conversation;
    if (dto.conversationId) {
      if (dto.documentIds) {
        throw AppException.badRequest(
          ErrorCode.VALIDATION_FAILED,
          'documentIds chỉ dùng khi tạo hội thoại mới',
        );
      }
      conversation = await this.conversations.getOwnedOrThrow(userId, dto.conversationId);
      if (conversation.documentIds?.length) this.assertDocumentsVisible();
    } else {
      const documentIds = dto.documentIds
        ? await this.validateDocumentSelection(userId, dto.documentIds)
        : undefined;
      conversation = await this.conversations.create(userId, makeTitle(dto.content), documentIds);
    }

    // Đặt chỗ trước mọi await: hai POST đồng thời cùng hội thoại không thể cùng stream.
    const key = conversation._id.toString();
    const controller = this.reserveStream(key);
    try {
      const userMessage = await this.conversations.createMessage({
        conversationId: conversation._id,
        userId: conversation.userId,
        role: MessageRole.USER,
        content: dto.content,
      });
      await this.conversations.touch(conversation._id);

      await this.streamAnswer(conversation, userMessage, sse, controller, null);
    } finally {
      this.inFlight.delete(key);
    }
  }

  /**
   * Sinh lại câu trả lời cuối cho tin nhắn cuối của người dùng. Câu trả lời cũ (nếu có) được giữ
   * cho tới khi câu mới lưu thành công: Dừng hoặc lỗi giữa chừng thì câu cũ còn nguyên.
   */
  async regenerate(userId: string, conversationId: string, sse: SseStream): Promise<void> {
    const conversation = await this.conversations.getOwnedOrThrow(userId, conversationId);
    if (conversation.documentIds?.length) this.assertDocumentsVisible();

    const key = conversation._id.toString();
    const controller = this.reserveStream(key);
    try {
      const recent = await this.conversations.recentMessages(conversation._id, 2);
      let replacing: Message | null = null;
      let question = recent.at(-1);
      if (question?.role === MessageRole.ASSISTANT) {
        replacing = question;
        question = recent.at(-2);
      }
      if (question?.role !== MessageRole.USER) {
        throw AppException.badRequest(ErrorCode.CHAT_NOTHING_TO_REGENERATE);
      }

      await this.streamAnswer(conversation, null, sse, controller, replacing);
    } finally {
      this.inFlight.delete(key);
    }
  }

  /** Dừng stream đang chạy của hội thoại. Phần đã sinh vẫn được lưu với trạng thái STOPPED. */
  async stop(userId: string, conversationId: string): Promise<void> {
    await this.conversations.getOwnedOrThrow(userId, conversationId);
    this.abort(conversationId);
  }

  abort(conversationId: string): void {
    this.inFlight.get(conversationId)?.abort();
  }

  /** Chỗ stream của hội thoại (đã đăng ký trong `inFlight`); người gọi có trách nhiệm giải phóng. */
  private reserveStream(key: string): AbortController {
    if (this.inFlight.has(key)) throw AppException.conflict(ErrorCode.CHAT_STREAM_IN_PROGRESS);
    const controller = new AbortController();
    this.inFlight.set(key, controller);
    return controller;
  }

  private async streamAnswer(
    conversation: Conversation,
    userMessage: Message | null,
    sse: SseStream,
    controller: AbortController,
    // Câu trả lời cũ đang được Tạo lại: không đưa vào ngữ cảnh, được thay khi câu mới lưu xong.
    replacing: Message | null,
  ): Promise<void> {
    const limit = replacing ? CONTEXT_MESSAGES + 1 : CONTEXT_MESSAGES;
    const history = (await this.conversations.recentMessages(conversation._id, limit))
      .filter((m) => m._id.toString() !== replacing?._id.toString())
      .slice(-CONTEXT_MESSAGES);

    const key = conversation._id.toString();

    try {
      // Đóng tab / mất mạng cũng được xử lý như bấm Dừng.
      sse.open(() => controller.abort());
      sse.send({
        type: 'meta',
        conversation: toConversationDto(conversation),
        userMessage: userMessage ? toMessageDto(userMessage) : null,
      });

      // Câu hỏi mới nhất luôn là tin cuối trong history (send() hoặc regenerate() đã đặt sẵn).
      const { plan, failed } = await this.retrieveContext(conversation, history.at(-1)?.content ?? '');

      if (plan?.kind === 'insufficient') {
        // Không gọi LLM (không có dòng log usage) — gửi thẳng câu từ chối cố định.
        sse.send({ type: 'delta', text: RAG_REFUSAL_TEXT });
        await this.saveAnswer(
          conversation,
          replacing,
          { content: RAG_REFUSAL_TEXT, status: MessageStatus.COMPLETED, citations: [], insufficientEvidence: true },
          sse,
        );
        return;
      }

      const messages = buildLlmMessages(this.config.llm.systemPrompt, plan, history);
      // Truy hồi lỗi → lưu ERROR và không gọi LLM.
      const { content, status } = failed
        ? { content: '', status: MessageStatus.ERROR }
        : await this.generate(messages, controller, sse, key);

      // ERROR → không có trích dẫn; STOPPED/TRUNCATED vẫn xác minh trên phần nội dung đã sinh được.
      const verified =
        plan?.kind === 'ready' && status !== MessageStatus.ERROR
          ? this.rag.verifyCitations(content, plan.sources)
          : undefined;

      await this.saveAnswer(
        conversation,
        replacing,
        {
          content,
          status,
          model: this.llm.model,
          ...(verified
            ? {
                citations: verified.citations.map((c) => ({ ...c, documentId: new Types.ObjectId(c.documentId) })),
                insufficientEvidence: verified.insufficientEvidence,
                ungrounded: verified.ungrounded,
              }
            : {}),
        },
        sse,
      );
    } catch (error) {
      this.logger.error(`Stream lỗi ở hội thoại ${key}`, (error as Error).stack);
      sse.send({ type: 'error', code: ErrorCode.INTERNAL_ERROR });
    } finally {
      sse.end();
    }
  }

  /**
   * Truy hồi RAG khi hội thoại có tài liệu. Lỗi embed/Qdrant không ném: trả `failed = true`
   * để câu trả lời được lưu ERROR (có thể Tạo lại).
   */
  private async retrieveContext(
    conversation: Conversation,
    question: string,
  ): Promise<{ plan: RagPlan | null; failed: boolean }> {
    if (!conversation.documentIds?.length) return { plan: null, failed: false };
    try {
      const plan = await this.rag.prepare(conversation.userId.toString(), conversation.documentIds, question);
      return { plan, failed: false };
    } catch (error) {
      this.logger.error(`Truy hồi lỗi ở hội thoại ${conversation._id.toString()}`, (error as Error).stack);
      return { plan: null, failed: true };
    }
  }

  /**
   * Vòng stream LLM: gửi từng đoạn tới client và gom nội dung. Trạng thái kết thúc:
   * COMPLETED, TRUNCATED (hết token), STOPPED (người dùng dừng / đóng kết nối) hoặc ERROR.
   */
  private async generate(
    messages: LlmMessage[],
    controller: AbortController,
    sse: SseStream,
    key: string,
  ): Promise<{ content: string; status: MessageStatus }> {
    let content = '';
    let truncated = false;
    let status: MessageStatus = MessageStatus.COMPLETED;
    const onFinish = (reason: LlmFinishReason) => {
      truncated = reason === 'max_output_tokens';
    };
    try {
      for await (const chunk of this.llm.stream(messages, { signal: controller.signal, onFinish })) {
        content += chunk;
        sse.send({ type: 'delta', text: chunk });
        if (controller.signal.aborted) break;
      }
      if (controller.signal.aborted) status = MessageStatus.STOPPED;
      else if (truncated) status = MessageStatus.TRUNCATED;
    } catch (error) {
      status = controller.signal.aborted ? MessageStatus.STOPPED : MessageStatus.ERROR;
      if (status === MessageStatus.ERROR) {
        // Tên lỗi gốc (nếu có) để chẩn đoán; không ghi nội dung.
        const cause = (error as { cause?: unknown }).cause;
        const causeName = cause instanceof Error ? cause.name : 'unknown';
        this.logger.error(`LLM lỗi ở hội thoại ${key} cause=${causeName}`, (error as Error).stack);
      }
    }
    return { content, status };
  }

  /**
   * Lưu câu trả lời rồi gửi `done`. Hội thoại đã bị xóa thì bỏ qua (không gửi `done`).
   * Tạo lại mà Dừng/lỗi: không lưu câu dở, câu cũ còn nguyên và được gửi lại làm kết quả.
   * Tạo lại thành công: lưu câu mới, xóa câu cũ, rồi cập nhật thời gian hội thoại.
   */
  private async saveAnswer(
    conversation: Conversation,
    replacing: Message | null,
    fields: Omit<CreateMessageInput, 'conversationId' | 'userId' | 'role'>,
    sse: SseStream,
  ): Promise<void> {
    if (!(await this.conversations.exists(conversation._id))) return;

    if (replacing && fields.status !== MessageStatus.COMPLETED && fields.status !== MessageStatus.TRUNCATED) {
      sse.send({ type: 'done', message: toMessageDto(replacing) });
      return;
    }

    const answer = await this.conversations.createMessage({
      conversationId: conversation._id,
      userId: conversation.userId,
      role: MessageRole.ASSISTANT,
      ...fields,
    });
    if (replacing) await this.conversations.deleteMessage(replacing._id);
    await this.conversations.touch(conversation._id);
    sse.send({ type: 'done', message: toMessageDto(answer) });
  }

  /**
   * Kiểm tài liệu của hội thoại mới: Tài liệu phải hiển thị, số lượng không quá RAG_MAX_DOCUMENTS,
   * rồi ủy quyền kiểm sở hữu/READY cho DocumentsService.findReadyOwnedDocuments (404/400).
   */
  private async validateDocumentSelection(userId: string, documentIds: string[]): Promise<Types.ObjectId[]> {
    this.assertDocumentsVisible();
    if (documentIds.length > this.config.rag.maxDocuments) {
      throw AppException.badRequest(
        ErrorCode.VALIDATION_FAILED,
        `Tối đa ${this.config.rag.maxDocuments} tài liệu mỗi hội thoại`,
      );
    }
    return this.documents.findReadyOwnedDocuments(userId, documentIds);
  }

  /**
   * Chat chỉ dùng tài liệu khi module Tài liệu hiển thị (thiết kế mục 10); ẩn → 404 như tài liệu không tồn tại.
   * Gọi cả khi tiếp tục hội thoại cũ, vì bản staff có thể được bật sau khi hội thoại đã tạo.
   */
  private assertDocumentsVisible(): void {
    if (isDocumentsHidden(this.config)) {
      throw AppException.notFound(ErrorCode.DOCUMENT_NOT_FOUND);
    }
  }
}

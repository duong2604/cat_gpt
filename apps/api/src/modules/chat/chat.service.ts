import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { type ChatStreamEvent, ErrorCode, MessageRole, MessageStatus } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { isDocumentsHidden } from '../documents/documents-hidden.guard.js';
import { DocumentsService } from '../documents/documents.service.js';
import { type LlmFinishReason, type LlmMessage, LlmProvider } from '../llm/llm.provider.js';
import { RAG_REFUSAL_TEXT } from '../rag/rag-prompt.js';
import type { RagPlan } from '../rag/rag.service.js';
import { RagService } from '../rag/rag.service.js';
import { toConversationDto, toMessageDto } from './chat.presenter.js';
import { type AnswerFields, ConversationsService } from './conversations.service.js';
import type { SendMessageDto } from './dto/chat.dto.js';
import type { Conversation } from './schemas/conversation.schema.js';
import type { Message } from './schemas/message.schema.js';

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
 * Kết quả pha trước stream (kiểm quyền, đặt khóa inFlight, lưu tin USER): đã thành công thì
 * lỗi từ đây trở đi trả về JSON; lượt được chạy bằng run() khi stream bắt đầu.
 */
export interface ChatTurn {
  conversation: Conversation;
  userMessage: Message | null;
  /** Câu trả lời cũ đang được Tạo lại (null nếu không phải Tạo lại). */
  replacing: Message | null;
  /** Lịch sử gửi LLM, đã bỏ câu cũ đang được thay. */
  history: Message[];
  key: string;
  controller: AbortController;
}

/**
 * Gửi tin nhắn và stream câu trả lời của LLM qua SSE (xem `sse-response.ts`).
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

  /** Pha trước stream của gửi tin: lỗi ném ra sẽ thành JSON (400/404/409…). */
  async prepareSend(userId: string, dto: SendMessageDto): Promise<ChatTurn> {
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
    const plan: ChatTurn = { conversation, userMessage: null, replacing: null, history: [], key, controller };
    try {
      plan.userMessage = await this.conversations.createMessage({
        conversationId: conversation._id,
        userId: conversation.userId,
        role: MessageRole.USER,
        content: dto.content,
      });
      await this.conversations.touch(conversation._id);
      plan.history = await this.loadHistory(conversation, null);
      return plan;
    } catch (error) {
      this.release(plan);
      throw error;
    }
  }

  /**
   * Sinh lại câu trả lời cuối cho tin nhắn cuối của người dùng. Câu trả lời cũ (nếu có) được giữ
   * cho tới khi câu mới lưu thành công: Dừng hoặc lỗi giữa chừng thì câu cũ còn nguyên.
   */
  async prepareRegenerate(userId: string, conversationId: string): Promise<ChatTurn> {
    const conversation = await this.conversations.getOwnedOrThrow(userId, conversationId);
    if (conversation.documentIds?.length) this.assertDocumentsVisible();

    const key = conversation._id.toString();
    const controller = this.reserveStream(key);
    const plan: ChatTurn = { conversation, userMessage: null, replacing: null, history: [], key, controller };
    try {
      const recent = await this.conversations.recentMessages(conversation._id, 2);
      let question = recent.at(-1);
      if (question?.role === MessageRole.ASSISTANT) {
        plan.replacing = question;
        question = recent.at(-2);
      }
      if (question?.role !== MessageRole.USER) {
        throw AppException.badRequest(ErrorCode.CHAT_NOTHING_TO_REGENERATE);
      }
      plan.history = await this.loadHistory(conversation, plan.replacing);
      return plan;
    } catch (error) {
      this.release(plan);
      throw error;
    }
  }

  /**
   * Chạy phần stream của một lượt (sau `prepare*`), gửi từng event qua `emit`. Lỗi trong stream được
   * gửi như event `{type:'error'}`. Khóa inFlight được nhả trong `finally`, kể cả khi lượt bị hủy.
   */
  async run(plan: ChatTurn, emit: (event: ChatStreamEvent) => void): Promise<void> {
    try {
      await this.runStream(plan, emit);
    } finally {
      this.release(plan);
    }
  }

  /** Client ngắt (NestJS gọi cancel): hủy LLM. Phần đã sinh được lưu STOPPED; khóa nhả trong `run`. */
  cancel(plan: ChatTurn): void {
    plan.controller.abort();
  }

  /** Dừng stream đang chạy của hội thoại. Phần đã sinh vẫn được lưu với trạng thái STOPPED. */
  async stop(userId: string, conversationId: string): Promise<void> {
    await this.conversations.getOwnedOrThrow(userId, conversationId);
    this.abort(conversationId);
  }

  abort(conversationId: string): void {
    this.inFlight.get(conversationId)?.abort();
  }

  /** Chỗ stream của hội thoại (đã đăng ký trong `inFlight`); `release` nhả lại. */
  private reserveStream(key: string): AbortController {
    if (this.inFlight.has(key)) throw AppException.conflict(ErrorCode.CHAT_STREAM_IN_PROGRESS);
    const controller = new AbortController();
    this.inFlight.set(key, controller);
    return controller;
  }

  /** Nhả khóa inFlight của lượt này (chỉ khi khóa vẫn là của lượt này). */
  private release(plan: ChatTurn): void {
    if (this.inFlight.get(plan.key) === plan.controller) this.inFlight.delete(plan.key);
  }

  /** Lịch sử gửi LLM (không gồm câu đang được thay). */
  private async loadHistory(conversation: Conversation, replacing: Message | null): Promise<Message[]> {
    const limit = replacing ? CONTEXT_MESSAGES + 1 : CONTEXT_MESSAGES;
    return (await this.conversations.recentMessages(conversation._id, limit))
      .filter((m) => m._id.toString() !== replacing?._id.toString())
      .slice(-CONTEXT_MESSAGES);
  }

  private async runStream(plan: ChatTurn, emit: (event: ChatStreamEvent) => void): Promise<void> {
    const { conversation, userMessage, replacing, history, key, controller } = plan;
    try {
      emit({
        type: 'meta',
        conversation: toConversationDto(conversation),
        userMessage: userMessage ? toMessageDto(userMessage) : null,
      });

      // Câu hỏi mới nhất luôn là tin cuối trong history (send() hoặc regenerate() đã đặt sẵn).
      const { plan: ragPlan, failed } = await this.retrieveContext(conversation, history.at(-1)?.content ?? '');

      if (ragPlan?.kind === 'insufficient') {
        // Không gọi LLM (không có dòng log usage) — gửi thẳng câu từ chối cố định.
        emit({ type: 'delta', text: RAG_REFUSAL_TEXT });
        await this.saveAnswer(
          conversation,
          replacing,
          { content: RAG_REFUSAL_TEXT, status: MessageStatus.COMPLETED, citations: [], insufficientEvidence: true },
          emit,
        );
        return;
      }

      const messages = buildLlmMessages(this.config.llm.systemPrompt, ragPlan, history);
      // Truy hồi lỗi → lưu ERROR và không gọi LLM.
      const { content, status } = failed
        ? { content: '', status: MessageStatus.ERROR }
        : await this.generate(messages, controller, emit, key);

      // ERROR → không có trích dẫn; STOPPED/TRUNCATED vẫn xác minh trên phần nội dung đã sinh được.
      const verified =
        ragPlan?.kind === 'ready' && status !== MessageStatus.ERROR
          ? this.rag.verifyCitations(content, ragPlan.sources)
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
        emit,
      );
    } catch (error) {
      this.logger.error(`Stream lỗi ở hội thoại ${key}`, (error as Error).stack);
      emit({ type: 'error', code: ErrorCode.INTERNAL_ERROR });
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
    emit: (event: ChatStreamEvent) => void,
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
        emit({ type: 'delta', text: chunk });
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
   * Tạo lại thành công: thay nội dung câu cũ tại chỗ bằng một lệnh ghi, rồi cập nhật thời gian hội thoại.
   */
  private async saveAnswer(
    conversation: Conversation,
    replacing: Message | null,
    fields: AnswerFields,
    emit: (event: ChatStreamEvent) => void,
  ): Promise<void> {
    if (!(await this.conversations.exists(conversation._id))) return;

    if (replacing) {
      if (fields.status !== MessageStatus.COMPLETED && fields.status !== MessageStatus.TRUNCATED) {
        emit({ type: 'done', message: toMessageDto(replacing) });
        return;
      }
      // Tin đã bị xóa giữa chừng (matchedCount = 0) → như hội thoại đã xóa: không gửi `done`.
      if (!(await this.conversations.replaceAnswer(replacing._id, conversation._id, fields))) return;
      await this.conversations.touch(conversation._id);
      // `done` dựng từ đúng những gì vừa ghi (id và createdAt của câu cũ giữ nguyên); không đọc lại.
      const updated: Message = {
        ...replacing,
        content: fields.content,
        status: fields.status ?? MessageStatus.COMPLETED,
        model: fields.model ?? null,
        citations: fields.citations,
        insufficientEvidence: fields.insufficientEvidence,
        ungrounded: fields.ungrounded,
      };
      emit({ type: 'done', message: toMessageDto(updated) });
      return;
    }

    const answer = await this.conversations.createMessage({
      conversationId: conversation._id,
      userId: conversation.userId,
      role: MessageRole.ASSISTANT,
      ...fields,
    });
    await this.conversations.touch(conversation._id);
    emit({ type: 'done', message: toMessageDto(answer) });
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

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ErrorCode, MessageRole, MessageStatus } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { type LlmMessage, LlmProvider } from '../llm/llm.provider.js';
import { toConversationDto, toMessageDto } from './chat.presenter.js';
import { ConversationsService } from './conversations.service.js';
import type { SendMessageDto } from './dto/chat.dto.js';
import type { Conversation } from './schemas/conversation.schema.js';
import type { Message } from './schemas/message.schema.js';
import type { SseStream } from './sse-stream.js';

/** Số tin nhắn gần nhất gửi kèm làm ngữ cảnh cho LLM. */
const CONTEXT_MESSAGES = 20;
const TITLE_LENGTH = 50;
/** Giới hạn gửi tin nhắn / tạo lại câu trả lời: 20 lần mỗi phút cho mỗi người dùng. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

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
 * Gửi tin nhắn và stream câu trả lời của LLM qua SSE.
 * Câu trả lời được gom trong bộ nhớ và lưu một lần khi kết thúc (hoàn tất / dừng / lỗi).
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  // ponytail: lưu trong bộ nhớ của một tiến trình API; chạy nhiều instance thì chuyển sang Redis.
  /** Hội thoại đang stream → bộ điều khiển hủy (dùng cho nút Dừng và chặn stream song song). */
  private readonly inFlight = new Map<string, AbortController>();
  /** userId → các mốc thời gian gửi tin nhắn trong cửa sổ giới hạn. */
  private readonly sendLog = new Map<string, number[]>();

  constructor(
    private readonly conversations: ConversationsService,
    private readonly llm: LlmProvider,
    private readonly config: AppConfigService,
  ) {}

  async send(userId: string, dto: SendMessageDto, sse: SseStream): Promise<void> {
    this.assertRateLimit(userId);

    let conversation: Conversation;
    if (dto.conversationId) {
      conversation = await this.conversations.getOwnedOrThrow(userId, dto.conversationId);
      this.assertNotStreaming(conversation);
    } else {
      conversation = await this.conversations.create(userId, makeTitle(dto.content));
    }

    const userMessage = await this.conversations.createMessage({
      conversationId: conversation._id,
      userId: conversation.userId,
      role: MessageRole.USER,
      content: dto.content,
    });
    await this.conversations.touch(conversation._id);

    await this.streamAnswer(conversation, userMessage, sse);
  }

  /** Bỏ câu trả lời cuối của assistant (nếu có) rồi sinh lại cho tin nhắn cuối của người dùng. */
  async regenerate(userId: string, conversationId: string, sse: SseStream): Promise<void> {
    this.assertRateLimit(userId);
    const conversation = await this.conversations.getOwnedOrThrow(userId, conversationId);
    this.assertNotStreaming(conversation);

    let last = await this.conversations.lastMessage(conversation._id);
    if (last?.role === MessageRole.ASSISTANT) {
      await this.conversations.deleteMessage(last._id);
      last = await this.conversations.lastMessage(conversation._id);
    }
    if (last?.role !== MessageRole.USER) {
      throw AppException.badRequest(ErrorCode.CHAT_NOTHING_TO_REGENERATE);
    }

    await this.streamAnswer(conversation, null, sse);
  }

  /** Dừng stream đang chạy của hội thoại. Phần đã sinh vẫn được lưu với trạng thái STOPPED. */
  async stop(userId: string, conversationId: string): Promise<void> {
    await this.conversations.getOwnedOrThrow(userId, conversationId);
    this.abort(conversationId);
  }

  abort(conversationId: string): void {
    this.inFlight.get(conversationId)?.abort();
  }

  private async streamAnswer(
    conversation: Conversation,
    userMessage: Message | null,
    sse: SseStream,
  ): Promise<void> {
    const history = await this.conversations.recentMessages(conversation._id, CONTEXT_MESSAGES);
    const messages: LlmMessage[] = [
      { role: 'system', content: this.config.llm.systemPrompt },
      ...history
        .filter((m) => m.content.trim())
        .map((m) => ({ role: LLM_ROLE[m.role], content: m.content })),
    ];

    const key = conversation._id.toString();
    const controller = new AbortController();
    this.inFlight.set(key, controller);

    try {
      // Đóng tab / mất mạng cũng được xử lý như bấm Dừng.
      sse.open(() => controller.abort());
      sse.send({
        type: 'meta',
        conversation: toConversationDto(conversation),
        userMessage: userMessage ? toMessageDto(userMessage) : null,
      });

      let content = '';
      let status: MessageStatus = MessageStatus.COMPLETED;
      try {
        for await (const chunk of this.llm.stream(messages, { signal: controller.signal })) {
          content += chunk;
          sse.send({ type: 'delta', text: chunk });
          if (controller.signal.aborted) break;
        }
        if (controller.signal.aborted) status = MessageStatus.STOPPED;
      } catch (error) {
        status = controller.signal.aborted ? MessageStatus.STOPPED : MessageStatus.ERROR;
        if (status === MessageStatus.ERROR) {
          this.logger.error(`LLM lỗi ở hội thoại ${key}`, (error as Error).stack);
        }
      }

      // Hội thoại bị xóa trong lúc đang stream → không lưu tin nhắn mồ côi.
      if (!(await this.conversations.exists(conversation._id))) return;

      const answer = await this.conversations.createMessage({
        conversationId: conversation._id,
        userId: conversation.userId,
        role: MessageRole.ASSISTANT,
        content,
        status,
        model: this.llm.model,
      });
      await this.conversations.touch(conversation._id);
      sse.send({ type: 'done', message: toMessageDto(answer) });
    } catch (error) {
      this.logger.error(`Stream lỗi ở hội thoại ${key}`, (error as Error).stack);
      sse.send({ type: 'error', code: ErrorCode.INTERNAL_ERROR });
    } finally {
      this.inFlight.delete(key);
      sse.end();
    }
  }

  private assertNotStreaming(conversation: Conversation): void {
    if (this.inFlight.has(conversation._id.toString())) {
      throw AppException.conflict(ErrorCode.CHAT_STREAM_IN_PROGRESS);
    }
  }

  private assertRateLimit(userId: string): void {
    const now = Date.now();
    const recent = (this.sendLog.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_LIMIT) {
      throw new AppException(ErrorCode.TOO_MANY_REQUESTS, HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.sendLog.set(userId, recent);
  }
}

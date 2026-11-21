import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, type QueryFilter, Types } from 'mongoose';
import {
  type ConversationDto,
  type CursorPage,
  ErrorCode,
  MessageRole,
  MessageStatus,
} from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex } from '../../common/utils/escape-regex.js';
import { toConversationDto } from './chat.presenter.js';
import type { ListConversationsQueryDto } from './dto/chat.dto.js';
import { Conversation } from './schemas/conversation.schema.js';
import { Citation, Message } from './schemas/message.schema.js';

export interface CreateMessageInput {
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: MessageRole;
  content: string;
  status?: MessageStatus;
  model?: string | null;
  /** Chỉ ở tin assistant của hội thoại có `documentIds` (Module 4). */
  citations?: Citation[];
  insufficientEvidence?: boolean;
  ungrounded?: boolean;
}

/** Các trường ghi của câu trả lời (không gồm khóa và vai trò). */
export type AnswerFields = Omit<CreateMessageInput, 'conversationId' | 'userId' | 'role'>;

/** Cursor dạng `<lastMessageAt ms>_<id>`: ổn định kể cả khi nhiều hội thoại trùng thời điểm. */
function encodeCursor(c: Conversation): string {
  return `${c.lastMessageAt.getTime()}_${c._id.toString()}`;
}

function decodeCursor(cursor: string): { at: Date; id: Types.ObjectId } {
  const [ms, id] = cursor.split('_');
  const at = new Date(Number(ms));
  if (Number.isNaN(at.getTime()) || !isValidObjectId(id)) {
    throw AppException.badRequest(ErrorCode.VALIDATION_FAILED, 'Invalid cursor');
  }
  return { at, id: new Types.ObjectId(id) };
}

/**
 * Truy cập hội thoại và tin nhắn. Mọi thao tác đều lọc theo userId:
 * hội thoại của người khác được coi như không tồn tại (không lộ thông tin qua 403).
 */
@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async list(userId: string, query: ListConversationsQueryDto): Promise<CursorPage<ConversationDto>> {
    const filter: QueryFilter<Conversation> = { userId: new Types.ObjectId(userId) };
    if (query.q) filter.title = new RegExp(escapeRegex(query.q), 'i');
    if (query.cursor) {
      const { at, id } = decodeCursor(query.cursor);
      filter.$or = [{ lastMessageAt: { $lt: at } }, { lastMessageAt: at, _id: { $lt: id } }];
    }

    // Lấy dư một bản ghi để biết còn trang sau hay không.
    const rows = await this.conversationModel
      .find(filter)
      .sort({ lastMessageAt: -1, _id: -1 })
      .limit(query.limit + 1)
      .lean<Conversation[]>()
      .exec();

    const items = rows.slice(0, query.limit);
    const hasMore = rows.length > query.limit;
    return {
      items: items.map(toConversationDto),
      nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null,
    };
  }

  async getOwnedOrThrow(userId: string, id: string): Promise<Conversation> {
    const conversation = isValidObjectId(id)
      ? await this.conversationModel
          .findOne({ _id: id, userId: new Types.ObjectId(userId) })
          .lean<Conversation>()
          .exec()
      : null;
    if (!conversation) throw AppException.notFound(ErrorCode.CONVERSATION_NOT_FOUND);
    return conversation;
  }

  async create(userId: string, title: string, documentIds?: Types.ObjectId[]): Promise<Conversation> {
    const doc = await this.conversationModel.create({
      userId: new Types.ObjectId(userId),
      title,
      lastMessageAt: new Date(),
      ...(documentIds ? { documentIds } : {}),
    });
    return doc.toObject();
  }

  async rename(userId: string, id: string, title: string): Promise<Conversation> {
    await this.getOwnedOrThrow(userId, id);
    await this.conversationModel.updateOne({ _id: id }, { $set: { title } }).exec();
    return this.getOwnedOrThrow(userId, id);
  }

  /** Xóa hẳn hội thoại cùng toàn bộ tin nhắn. */
  async delete(userId: string, id: string): Promise<void> {
    await this.getOwnedOrThrow(userId, id);
    await this.messageModel.deleteMany({ conversationId: new Types.ObjectId(id) }).exec();
    await this.conversationModel.deleteOne({ _id: id }).exec();
  }

  /** Cập nhật thời điểm hoạt động; trả về false nếu hội thoại đã bị xóa. */
  async touch(id: Types.ObjectId): Promise<boolean> {
    const result = await this.conversationModel
      .updateOne({ _id: id }, { $set: { lastMessageAt: new Date() } })
      .exec();
    return result.matchedCount > 0;
  }

  async exists(id: Types.ObjectId): Promise<boolean> {
    return (await this.conversationModel.exists({ _id: id })) !== null;
  }

  async listMessages(conversationId: Types.ObjectId): Promise<Message[]> {
    return this.messageModel
      .find({ conversationId })
      .sort({ createdAt: 1, _id: 1 })
      .lean<Message[]>()
      .exec();
  }

  /** `limit` tin nhắn gần nhất, theo thứ tự thời gian tăng dần (dùng làm ngữ cảnh cho LLM). */
  async recentMessages(conversationId: Types.ObjectId, limit: number): Promise<Message[]> {
    const rows = await this.messageModel
      .find({ conversationId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean<Message[]>()
      .exec();
    return rows.reverse();
  }


  async createMessage(input: CreateMessageInput): Promise<Message> {
    const doc = await this.messageModel.create(input);
    return doc.toObject();
  }

  /**
   * Thay nội dung câu trả lời tại chỗ bằng MỘT lệnh ghi: câu cũ và câu mới không cùng tồn tại,
   * kể cả khi tiến trình dừng giữa chừng. Trường tùy chọn không có trong `fields` được `$unset`;
   * `model` không có thì ghi `null` (giống `createMessage`). `createdAt`, `userId`, `role` giữ nguyên.
   * Trả `false` khi không còn tin assistant đó trong hội thoại.
   */
  async replaceAnswer(id: Types.ObjectId, conversationId: Types.ObjectId, fields: AnswerFields): Promise<boolean> {
    const $set: Record<string, unknown> = {
      content: fields.content,
      status: fields.status ?? MessageStatus.COMPLETED,
      model: fields.model ?? null,
    };
    const unset: Record<string, ''> = {};
    for (const key of ['citations', 'insufficientEvidence', 'ungrounded'] as const) {
      if (fields[key] !== undefined) $set[key] = fields[key];
      else unset[key] = '';
    }
    const update = Object.keys(unset).length > 0 ? { $set, $unset: unset } : { $set };
    const result = await this.messageModel
      .updateOne({ _id: id, conversationId, role: MessageRole.ASSISTANT }, update)
      .exec();
    return result.matchedCount > 0;
  }
}

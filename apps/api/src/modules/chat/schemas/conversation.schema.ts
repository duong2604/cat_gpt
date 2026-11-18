import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CONVERSATION_TITLE_MAX_LENGTH } from '@cat-gpt/shared';

@Schema({ collection: 'conversations', timestamps: true })
export class Conversation {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: CONVERSATION_TITLE_MAX_LENGTH })
  title: string;

  /** Dùng để sắp xếp danh sách hội thoại (mới hoạt động lên đầu). */
  @Prop({ type: Date, required: true })
  lastMessageAt: Date;

  /** Tài liệu hỏi–đáp (Module 4) — cố định khi tạo; không có → Chat thường (thiết kế mục 4). */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'DocumentEntity' }], default: undefined })
  documentIds?: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export type ConversationDocument = HydratedDocument<Conversation>;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ userId: 1, lastMessageAt: -1, _id: -1 });

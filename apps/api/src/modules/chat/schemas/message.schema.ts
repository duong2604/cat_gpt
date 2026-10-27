import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MessageRole, MessageStatus } from '@cat-gpt/shared';

@Schema({ collection: 'messages', timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(MessageRole), required: true })
  role: MessageRole;

  /** Có thể rỗng khi câu trả lời bị dừng/lỗi trước khi sinh được chữ nào. */
  @Prop({ type: String, default: '' })
  content: string;

  @Prop({ type: String, enum: Object.values(MessageStatus), default: MessageStatus.COMPLETED })
  status: MessageStatus;

  /** Model đã sinh câu trả lời (chỉ có ở tin nhắn của assistant). */
  @Prop({ type: String, default: null })
  model: string | null;

  createdAt: Date;
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

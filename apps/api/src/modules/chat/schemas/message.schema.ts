import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessageRole, MessageStatus } from '@cat-gpt/shared';

/**
 * Trích dẫn — sao chép từ payload Qdrant tại thời điểm trả lời (không tham chiếu `ref`):
 * `documentName` phải giữ nguyên dù tài liệu gốc bị xóa sau đó (thiết kế mục 4).
 */
@Schema({ _id: false })
export class Citation {
  @Prop({ type: Number, required: true })
  n: number;

  @Prop({ type: Types.ObjectId, required: true })
  documentId: Types.ObjectId;

  @Prop({ type: String, required: true })
  documentName: string;

  @Prop({ type: Number, required: true })
  chunkIndex: number;

  @Prop({ type: Number })
  page?: number;

  /** ≤ 300 ký tự, cắt từ payload Qdrant (thiết kế mục 4). */
  @Prop({ type: String, required: true, maxlength: 300 })
  quote: string;
}
const CitationSchema = SchemaFactory.createForClass(Citation);

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

  /** Chỉ ở tin assistant của hội thoại có `documentIds` (Module 4, thiết kế mục 6.3). */
  @Prop({ type: [CitationSchema], default: undefined })
  citations?: Citation[];

  @Prop({ type: Boolean, default: undefined })
  insufficientEvidence?: boolean;

  @Prop({ type: Boolean, default: undefined })
  ungrounded?: boolean;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

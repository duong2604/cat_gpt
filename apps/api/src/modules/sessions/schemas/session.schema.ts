import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** Mỗi lần đăng nhập tạo một phiên; refresh token gắn với phiên. */
@Schema({ collection: 'sessions', timestamps: { createdAt: true, updatedAt: false } })
export class Session {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** SHA-256 của phần bí mật trong refresh token hiện hành. */
  @Prop({ required: true })
  tokenHash: string;

  /** Hash của token trước lần xoay vòng gần nhất — để xử lý nhiều tab refresh cùng lúc. */
  @Prop({ type: String, default: null })
  previousTokenHash: string | null;

  @Prop({ type: Date, default: null })
  rotatedAt: Date | null;

  @Prop({ type: String, default: null })
  userAgent: string | null;

  @Prop({ type: String, default: null })
  ip: string | null;

  @Prop({ type: Date, required: true })
  lastUsedAt: Date;

  /** TTL index: MongoDB tự xóa phiên khi quá hạn. */
  @Prop({ type: Date, required: true, expires: 0 })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  revokedAt: Date | null;

  createdAt: Date;
}

export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ userId: 1, revokedAt: 1 });

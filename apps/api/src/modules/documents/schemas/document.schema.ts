import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DocumentStatus } from '@cat-gpt/shared';

@Schema({ collection: 'documents', timestamps: true })
export class DocumentEntity {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, maxlength: 255 })
  name: string;

  @Prop({ type: String, required: true })
  mimeType: string;

  @Prop({ type: Number, required: true })
  size: number;

  /** `documents/<userId>/<documentId>` — không chứa tên tệp gốc. */
  @Prop({ type: String, required: true })
  storageKey: string;

  @Prop({ type: String, required: true, enum: Object.values(DocumentStatus), default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Prop({ type: String, default: null })
  errorCode: string | null;

  @Prop({ type: Number, default: null })
  chunkCount: number | null;

  /** Đặt khi người dùng xóa; bản ghi bị ẩn khỏi mọi API cho tới khi job delete xóa hẳn. */
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export type DocumentEntityDocument = HydratedDocument<DocumentEntity>;
export const DocumentEntitySchema = SchemaFactory.createForClass(DocumentEntity);

DocumentEntitySchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });

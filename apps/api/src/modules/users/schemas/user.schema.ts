import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole, UserStatus } from '@cat-gpt/shared';

@Schema({ collection: 'users', timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  /** Không bao giờ trả về client. `select: false` để mặc định không load. */
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ type: String, default: null, trim: true })
  phone: string | null;

  @Prop({ type: String, default: null, trim: true })
  department: string | null;

  /** Key trong StorageService, URL được tính khi trả về client. */
  @Prop({ type: String, default: null })
  avatarKey: string | null;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER, index: true })
  role: UserRole;

  @Prop({ type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE, index: true })
  status: UserStatus;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ createdAt: -1 });

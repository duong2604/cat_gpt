import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, type QueryFilter, Types } from 'mongoose';
import { ErrorCode, UserRole, UserStatus } from '@cat-gpt/shared';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex } from '../../common/utils/escape-regex.js';
import { hashPassword } from '../../common/utils/password-hash.js';
import { User } from './schemas/user.schema.js';

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string | null;
  department?: string | null;
  createdBy?: string | null;
}

export type UpdateUserInput = Partial<
  Pick<User, 'email' | 'fullName' | 'phone' | 'department' | 'role' | 'status' | 'avatarKey'>
>;

export interface ListUsersFilter {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  skip: number;
  limit: number;
}

const DUPLICATE_KEY_ERROR = 11000;

/** Truy cập dữ liệu người dùng. Không chứa quy tắc phân quyền (nằm ở các service gọi tới). */
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) return null;
    return this.userModel.findById(id).lean<User>().exec();
  }

  async getByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw AppException.notFound(ErrorCode.USER_NOT_FOUND);
    return user;
  }

  /** Lấy kèm passwordHash — chỉ dùng cho xác thực. */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+passwordHash')
      .lean<User>()
      .exec();
  }

  async getPasswordHash(id: string): Promise<string> {
    const user = await this.userModel.findById(id).select('+passwordHash').lean<User>().exec();
    if (!user) throw AppException.notFound(ErrorCode.USER_NOT_FOUND);
    return user.passwordHash;
  }

  async create(input: CreateUserInput): Promise<User> {
    const passwordHash = await hashPassword(input.password);
    try {
      const doc = await this.userModel.create({
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        phone: input.phone ?? null,
        department: input.department ?? null,
        createdBy: input.createdBy ? new Types.ObjectId(input.createdBy) : null,
      });
      return this.getByIdOrThrow(doc._id.toString());
    } catch (error) {
      throw this.mapDuplicateEmail(error);
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    if (!isValidObjectId(id)) throw AppException.notFound(ErrorCode.USER_NOT_FOUND);
    try {
      const result = await this.userModel
        .updateOne({ _id: id }, { $set: input }, { runValidators: true })
        .exec();
      if (result.matchedCount === 0) throw AppException.notFound(ErrorCode.USER_NOT_FOUND);
      return this.getByIdOrThrow(id);
    } catch (error) {
      throw this.mapDuplicateEmail(error);
    }
  }

  async setPassword(id: string, plain: string): Promise<void> {
    const passwordHash = await hashPassword(plain);
    await this.userModel.updateOne({ _id: id }, { $set: { passwordHash } }).exec();
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } }).exec();
  }

  async countActiveAdmins(): Promise<number> {
    return this.userModel
      .countDocuments({ role: UserRole.ADMIN, status: UserStatus.ACTIVE })
      .exec();
  }

  async existsAnyAdmin(): Promise<boolean> {
    return (await this.userModel.exists({ role: UserRole.ADMIN })) !== null;
  }

  async list(filter: ListUsersFilter): Promise<{ items: User[]; total: number }> {
    const query: QueryFilter<User> = {};
    if (filter.role) query.role = filter.role;
    if (filter.status) query.status = filter.status;
    if (filter.search) {
      const pattern = new RegExp(escapeRegex(filter.search), 'i');
      query.$or = [{ email: pattern }, { fullName: pattern }, { department: pattern }];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip(filter.skip)
        .limit(filter.limit)
        .lean<User[]>()
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  private mapDuplicateEmail(error: unknown): unknown {
    if ((error as { code?: number })?.code === DUPLICATE_KEY_ERROR) {
      return AppException.conflict(ErrorCode.USER_EMAIL_EXISTS);
    }
    return error;
  }
}

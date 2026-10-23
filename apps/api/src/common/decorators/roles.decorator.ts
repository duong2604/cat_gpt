import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@cat-gpt/shared';

export const ROLES_KEY = 'roles';

/** Giới hạn endpoint cho các vai trò được liệt kê. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

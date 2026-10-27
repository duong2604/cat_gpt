import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { UserRole } from '@cat-gpt/shared';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { AppException } from '../exceptions/app.exception.js';
import type { AuthUser } from '../types/auth-user.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const user = context.switchToHttp().getRequest<Request>().user as AuthUser | undefined;
    if (!user || !roles.includes(user.role)) {
      throw AppException.forbidden();
    }
    return true;
  }
}

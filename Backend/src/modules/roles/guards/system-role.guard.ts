import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppException } from '../../../common/exceptions/app.exception.js';
import {
  PROTECT_SYSTEM_ROLE_KEY,
  ROLE_ERRORS,
} from '../constants/roles.constants.js';
import { RolesRepository } from '../roles.repository.js';
import type { ProtectedRoleAction } from '../types/role.type.js';

@Injectable()
export class SystemRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly repository: RolesRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<ProtectedRoleAction | undefined>(
      PROTECT_SYSTEM_ROLE_KEY,
      context.getHandler(),
    );
    if (!action) return true;

    const { params } = context.switchToHttp().getRequest<Request>();
    const role = await this.repository.findById(String(params.id));
    if (!role) throw new AppException(ROLE_ERRORS.NOT_FOUND);

    const blocked = action === 'delete' ? role.isSystem : role.isSuperAdmin;
    if (blocked) throw new AppException(ROLE_ERRORS.SYSTEM_PROTECTED);
    return true;
  }
}

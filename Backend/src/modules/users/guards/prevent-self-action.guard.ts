import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppException } from '../../../common/exceptions/app.exception.js';
import type { AuthenticatedRequest } from '../../auth/types/auth.type.js';
import {
  PREVENT_SELF_ACTION_KEY,
  USER_ERRORS,
} from '../constants/users.constants.js';

/** Stops admins locking themselves out (deactivate / re-role / delete self). */
@Injectable()
export class PreventSelfActionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const enabled = this.reflector.get<boolean | undefined>(
      PREVENT_SELF_ACTION_KEY,
      context.getHandler(),
    );
    if (!enabled) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user?.id === request.params.id) {
      throw new AppException(USER_ERRORS.SELF_ACTION_FORBIDDEN);
    }
    return true;
  }
}

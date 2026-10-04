import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COMMON_ERRORS } from '../../../common/constants/common.constants.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import type { AuthenticatedRequest } from '../../auth/types/auth.type.js';
import {
  REQUIRE_ANY_PERMISSION_KEY,
  REQUIRE_PERMISSIONS_KEY,
} from '../constants/permissions.constants.js';

/**
 * Global authorisation guard. Runs after `JwtAuthGuard`, which resolves the
 * caller's permission keys from the database on every request, so changes to
 * a role take effect immediately.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    const all = this.reflector.getAllAndOverride<string[] | undefined>(
      REQUIRE_PERMISSIONS_KEY,
      targets,
    );
    const any = this.reflector.getAllAndOverride<string[] | undefined>(
      REQUIRE_ANY_PERMISSION_KEY,
      targets,
    );

    if (!all?.length && !any?.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) throw new AppException(COMMON_ERRORS.UNAUTHORIZED);
    if (user.role?.isAdmin) return true;

    const held = new Set(user.permissions);
    const allowed =
      (!all?.length || all.every((key) => held.has(key))) &&
      (!any?.length || any.some((key) => held.has(key)));

    if (!allowed) throw new AppException(COMMON_ERRORS.FORBIDDEN);
    return true;
  }
}

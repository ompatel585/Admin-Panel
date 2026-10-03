import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COMMON_ERRORS } from '../../../common/constants/common.constants.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import { AuthService } from '../auth.service.js';
import {
  AUTH_COOKIE_NAME,
  IS_PUBLIC_KEY,
} from '../constants/auth.constants.js';
import type { AuthenticatedRequest } from '../types/auth.type.js';

/** Global guard: every route needs a valid session unless marked `@Public()`. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) throw new AppException(COMMON_ERRORS.UNAUTHORIZED);

    request.user = await this.authService.resolveAuthUser(token);
    return true;
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    const cookies = request.cookies as Record<string, string> | undefined;
    const fromCookie = cookies?.[AUTH_COOKIE_NAME];
    if (fromCookie) return fromCookie;

    const [type, value] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? value : undefined;
  }
}

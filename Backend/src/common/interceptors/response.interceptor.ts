import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../constants/common.constants.js';
import type { ApiSuccessBody } from '../types/api-response.type.js';

/** Wraps every successful response in `{ success, message, data }`. */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const message =
      this.reflector.get<string | undefined>(
        RESPONSE_MESSAGE_KEY,
        context.getHandler(),
      ) ?? 'OK';

    return next.handle().pipe(
      map((data: unknown) => {
        // Handlers that already return the envelope (e.g. /health) pass through.
        if (data && typeof data === 'object' && 'success' in data) return data;
        const body: ApiSuccessBody = {
          success: true,
          message,
          data: data ?? null,
        };
        return body;
      }),
    );
  }
}

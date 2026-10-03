import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { COMMON_ERRORS } from '../constants/common.constants.js';
import {
  AppException,
  type ErrorDefinition,
} from '../exceptions/app.exception.js';
import type { ApiErrorBody } from '../types/api-response.type.js';

interface ResolvedError {
  status: number;
  code: string;
  message: string;
  errors?: string[];
}

const STATUS_FALLBACK: Record<number, ErrorDefinition> = {
  [HttpStatus.BAD_REQUEST]: COMMON_ERRORS.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: COMMON_ERRORS.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: COMMON_ERRORS.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: COMMON_ERRORS.NOT_FOUND,
  [HttpStatus.CONFLICT]: COMMON_ERRORS.DUPLICATE,
};

/** The single place where any thrown error becomes an API error body. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const resolved = this.resolve(exception);

    if (resolved.status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiErrorBody = {
      success: false,
      statusCode: resolved.status,
      code: resolved.code,
      message: resolved.message,
      ...(resolved.errors && { errors: resolved.errors }),
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };
    response.status(resolved.status).json(body);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof AppException) {
      const body = exception.getResponse() as { code: string; message: string };
      return {
        status: exception.getStatus(),
        code: body.code,
        message: body.message,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const raw =
        typeof body === 'string'
          ? body
          : (body as { message?: string | string[] }).message;

      // ValidationPipe throws a 400 whose message is an array of violations.
      if (Array.isArray(raw)) {
        return {
          status,
          code: COMMON_ERRORS.VALIDATION_FAILED.code,
          message: COMMON_ERRORS.VALIDATION_FAILED.message,
          errors: raw,
        };
      }

      const fallback = STATUS_FALLBACK[status] ?? COMMON_ERRORS.INTERNAL;
      return {
        status,
        code: fallback.code,
        message: raw ?? exception.message,
      };
    }

    const error = exception as { code?: number; name?: string };
    if (error?.code === 11000) {
      return this.fromDefinition(COMMON_ERRORS.DUPLICATE);
    }
    if (error?.name === 'CastError' || error?.name === 'ValidationError') {
      return this.fromDefinition(COMMON_ERRORS.BAD_REQUEST);
    }

    return this.fromDefinition(COMMON_ERRORS.INTERNAL);
  }

  private fromDefinition(definition: ErrorDefinition): ResolvedError {
    return {
      status: definition.status,
      code: definition.code,
      message: definition.message,
    };
  }
}

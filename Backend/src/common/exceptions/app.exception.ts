import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Master error template. Every module declares its errors as
 * `ErrorDefinition`s (see each module's constants) and throws them through
 * `AppException`, so the API always answers with a machine-readable `code`
 * the frontend maps to its own message.
 */
export interface ErrorDefinition {
  code: string;
  message: string;
  status: HttpStatus;
}

export const defineErrors = <T extends Record<string, ErrorDefinition>>(
  errors: T,
): T => errors;

export class AppException extends HttpException {
  readonly code: string;

  constructor(definition: ErrorDefinition, message?: string) {
    super(
      { code: definition.code, message: message ?? definition.message },
      definition.status,
    );
    this.code = definition.code;
  }
}

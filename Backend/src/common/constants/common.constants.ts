import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../exceptions/app.exception.js';

export const COMMON_ERRORS = defineErrors({
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    message: 'Validation failed',
    status: HttpStatus.BAD_REQUEST,
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Bad request',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_ID: {
    code: 'INVALID_ID',
    message: 'Invalid identifier',
    status: HttpStatus.BAD_REQUEST,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    status: HttpStatus.UNAUTHORIZED,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action',
    status: HttpStatus.FORBIDDEN,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
    status: HttpStatus.NOT_FOUND,
  },
  DUPLICATE: {
    code: 'DUPLICATE',
    message: 'A record with these values already exists',
    status: HttpStatus.CONFLICT,
  },
  INTERNAL: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
});

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const SORT_ORDER = { ASC: 'asc', DESC: 'desc' } as const;

export const RESPONSE_MESSAGE_KEY = 'response_message';

import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const PREVENT_SELF_ACTION_KEY = 'prevent_self_action';

export const USER_ERRORS = defineErrors({
  NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    status: HttpStatus.NOT_FOUND,
  },
  EMAIL_TAKEN: {
    code: 'USER_EMAIL_TAKEN',
    message: 'An account with this email already exists',
    status: HttpStatus.CONFLICT,
  },
  SELF_ACTION_FORBIDDEN: {
    code: 'USER_SELF_ACTION_FORBIDDEN',
    message: 'You cannot perform this action on your own account',
    status: HttpStatus.FORBIDDEN,
  },
});

export const USER_MESSAGES = {
  CREATED: 'User created',
  UPDATED: 'User updated',
  STATUS_UPDATED: 'User status updated',
  ROLE_UPDATED: 'User role updated',
  DELETED: 'User deleted',
  FETCHED: 'Users fetched',
} as const;

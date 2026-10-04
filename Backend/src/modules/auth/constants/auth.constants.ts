import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const AUTH_COOKIE_NAME = 'access_token';
export const IS_PUBLIC_KEY = 'is_public';

export const AUTH_ERRORS = defineErrors({
  INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCOUNT_DISABLED: {
    code: 'AUTH_ACCOUNT_DISABLED',
    message: 'This account has been deactivated',
    status: HttpStatus.FORBIDDEN,
  },
  EMAIL_TAKEN: {
    code: 'AUTH_EMAIL_TAKEN',
    message: 'An account with this email already exists',
    status: HttpStatus.CONFLICT,
  },
  SESSION_INVALID: {
    code: 'AUTH_SESSION_INVALID',
    message: 'Your session is invalid or has expired',
    status: HttpStatus.UNAUTHORIZED,
  },
  RESET_TOKEN_INVALID: {
    code: 'AUTH_RESET_TOKEN_INVALID',
    message: 'This password reset link is invalid or has expired',
    status: HttpStatus.BAD_REQUEST,
  },
  CURRENT_PASSWORD_INCORRECT: {
    code: 'AUTH_CURRENT_PASSWORD_INCORRECT',
    message: 'Current password is incorrect',
    status: HttpStatus.BAD_REQUEST,
  },
  WORKSPACE_SUSPENDED: {
    code: 'AUTH_WORKSPACE_SUSPENDED',
    message: 'Your workspace has been suspended. Contact support',
    status: HttpStatus.FORBIDDEN,
  },
  DEFAULT_ROLE_MISSING: {
    code: 'AUTH_DEFAULT_ROLE_MISSING',
    message: 'No default role is configured for new accounts',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
});

export const AUTH_MESSAGES = {
  SIGNED_UP: 'Account created',
  LOGGED_IN: 'Logged in',
  LOGGED_OUT: 'Logged out',
  PROFILE: 'Profile fetched',
  RESET_REQUESTED:
    'If an account exists for that email, a reset link has been sent',
  PASSWORD_RESET: 'Password has been reset',
  PASSWORD_CHANGED: 'Password changed',
} as const;

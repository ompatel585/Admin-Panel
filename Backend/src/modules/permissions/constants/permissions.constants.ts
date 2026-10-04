import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';
export const REQUIRE_ANY_PERMISSION_KEY = 'require_any_permission';

/** Dot-separated, lowercase segments: `users` or `users.export`. */
export const PERMISSION_KEY_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;

/**
 * Keys that built-in endpoints are guarded by. Controllers have to name the
 * permission they require, so these strings live in code; the permissions
 * themselves (names, hierarchy, activation, role assignment) live in the DB
 * and are created from `seeds/permissions.seed.ts`.
 */
export const PERMISSION_KEYS = {
  USERS: {
    MODULE: 'users',
    READ: 'users.read',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
  },
  ROLES: {
    MODULE: 'roles',
    READ: 'roles.read',
    CREATE: 'roles.create',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
  },
  PERMISSIONS: {
    MODULE: 'permissions',
    READ: 'permissions.read',
    CREATE: 'permissions.create',
    UPDATE: 'permissions.update',
    DELETE: 'permissions.delete',
  },
  TENANTS: {
    MODULE: 'tenants',
    /** View the caller's own workspace. */
    READ: 'tenants.read',
    /** List every workspace on the platform. */
    LIST: 'tenants.list',
    CREATE: 'tenants.create',
    UPDATE: 'tenants.update',
    DELETE: 'tenants.delete',
    SUSPEND: 'tenants.suspend',
  },
  SITES: {
    MODULE: 'sites',
    READ: 'sites.read',
    CREATE: 'sites.create',
    UPDATE: 'sites.update',
    DELETE: 'sites.delete',
    CRAWL: 'sites.crawl',
  },
  CRAWL_JOBS: {
    MODULE: 'crawl_jobs',
    READ: 'crawl_jobs.read',
    CANCEL: 'crawl_jobs.cancel',
  },
} as const;

export const PERMISSION_ERRORS = defineErrors({
  NOT_FOUND: {
    code: 'PERMISSION_NOT_FOUND',
    message: 'Permission not found',
    status: HttpStatus.NOT_FOUND,
  },
  PARENT_NOT_FOUND: {
    code: 'PERMISSION_PARENT_NOT_FOUND',
    message: 'Parent permission not found',
    status: HttpStatus.NOT_FOUND,
  },
  KEY_TAKEN: {
    code: 'PERMISSION_KEY_TAKEN',
    message: 'A permission with this key already exists',
    status: HttpStatus.CONFLICT,
  },
  INVALID_KEY: {
    code: 'PERMISSION_INVALID_KEY',
    message:
      'Permission key must be lowercase, e.g. "reports" or "reports.export"',
    status: HttpStatus.BAD_REQUEST,
  },
  KEY_PARENT_MISMATCH: {
    code: 'PERMISSION_KEY_PARENT_MISMATCH',
    message:
      'A sub-permission key must be "<parent key>.<name>"; a module key cannot contain dots',
    status: HttpStatus.BAD_REQUEST,
  },
  NESTING_TOO_DEEP: {
    code: 'PERMISSION_NESTING_TOO_DEEP',
    message: 'Permissions support one level of sub-permissions only',
    status: HttpStatus.BAD_REQUEST,
  },
  HAS_CHILDREN: {
    code: 'PERMISSION_HAS_CHILDREN',
    message: 'Delete or move its sub-permissions first',
    status: HttpStatus.CONFLICT,
  },
  IN_USE: {
    code: 'PERMISSION_IN_USE',
    message: 'This permission is assigned to one or more roles',
    status: HttpStatus.CONFLICT,
  },
  SYSTEM_PROTECTED: {
    code: 'PERMISSION_SYSTEM_PROTECTED',
    message: 'System permissions cannot be deactivated or deleted',
    status: HttpStatus.FORBIDDEN,
  },
});

export const PERMISSION_MESSAGES = {
  CREATED: 'Permission created',
  UPDATED: 'Permission updated',
  DELETED: 'Permission deleted',
  FETCHED: 'Permissions fetched',
} as const;

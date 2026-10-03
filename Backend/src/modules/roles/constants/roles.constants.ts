import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const PROTECT_SYSTEM_ROLE_KEY = 'protect_system_role';

/** Roles the platform needs in order to work; created by the seeder. */
export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full access to everything, including permissions added later',
  },
  USER: {
    name: 'User',
    description: 'Default role assigned to new sign-ups',
  },
} as const;

export const ROLE_ERRORS = defineErrors({
  NOT_FOUND: {
    code: 'ROLE_NOT_FOUND',
    message: 'Role not found',
    status: HttpStatus.NOT_FOUND,
  },
  NAME_TAKEN: {
    code: 'ROLE_NAME_TAKEN',
    message: 'A role with this name already exists',
    status: HttpStatus.CONFLICT,
  },
  SYSTEM_PROTECTED: {
    code: 'ROLE_SYSTEM_PROTECTED',
    message: 'This is a system role and cannot be changed this way',
    status: HttpStatus.FORBIDDEN,
  },
  IN_USE: {
    code: 'ROLE_IN_USE',
    message: 'This role is assigned to one or more users',
    status: HttpStatus.CONFLICT,
  },
  INVALID_PERMISSIONS: {
    code: 'ROLE_INVALID_PERMISSIONS',
    message: 'One or more selected permissions do not exist',
    status: HttpStatus.BAD_REQUEST,
  },
  INACTIVE: {
    code: 'ROLE_INACTIVE',
    message: 'This role is inactive',
    status: HttpStatus.BAD_REQUEST,
  },
});

export const ROLE_MESSAGES = {
  CREATED: 'Role created',
  UPDATED: 'Role updated',
  PERMISSIONS_UPDATED: 'Role permissions updated',
  DELETED: 'Role deleted',
  FETCHED: 'Roles fetched',
} as const;

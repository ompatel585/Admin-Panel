import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

/** What a hidden role is called wherever it would otherwise be named. */
export const HIDDEN_ROLE_LABEL = 'Restricted';

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
  SUPER_ADMIN_ONLY: {
    code: 'ROLE_SUPER_ADMIN_ONLY',
    message: 'Only a super admin can add, edit or delete roles',
    status: HttpStatus.FORBIDDEN,
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
  ADMIN_ASSIGN_FORBIDDEN: {
    code: 'ROLE_ADMIN_ASSIGN_FORBIDDEN',
    message: 'The Admin role cannot be assigned to anyone',
    status: HttpStatus.FORBIDDEN,
  },
});

export const ROLE_MESSAGES = {
  FETCHED: 'Roles fetched',
  CREATED: 'Role created',
  UPDATED: 'Role updated',
  DELETED: 'Role deleted',
  PERMISSIONS_UPDATED: 'Role permissions updated',
} as const;

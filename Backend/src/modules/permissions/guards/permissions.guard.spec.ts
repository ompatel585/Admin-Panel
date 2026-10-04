import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppException } from '../../../common/exceptions/app.exception.js';
import type { AuthUser } from '../../auth/types/auth.type.js';
import { REQUIRE_PERMISSIONS_KEY } from '../constants/permissions.constants.js';
import { PermissionsGuard } from './permissions.guard.js';

const user = (permissions: string[], isAdmin = false): AuthUser => ({
  id: '1',
  name: 'Test',
  email: 't@test.com',
  role: { id: 'r', name: 'Role', isAdmin },
  tenant: null,
  permissions,
});

const run = (
  metadata: { all?: string[]; any?: string[] },
  caller?: AuthUser,
): boolean => {
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === REQUIRE_PERMISSIONS_KEY ? metadata.all : metadata.any,
  } as unknown as Reflector;

  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user: caller }) }),
  } as unknown as ExecutionContext;

  return new PermissionsGuard(reflector).canActivate(context);
};

describe('PermissionsGuard', () => {
  it('allows routes with no permission requirement', () => {
    expect(run({}, user([]))).toBe(true);
  });

  it('requires every permission for RequirePermissions', () => {
    expect(run({ all: ['a', 'b'] }, user(['a', 'b', 'c']))).toBe(true);
    expect(() => run({ all: ['a', 'b'] }, user(['a']))).toThrow(AppException);
  });

  it('requires at least one permission for RequireAnyPermission', () => {
    expect(run({ any: ['a', 'b'] }, user(['b']))).toBe(true);
    expect(() => run({ any: ['a', 'b'] }, user(['c']))).toThrow(AppException);
  });

  it('lets Admin through regardless of held keys', () => {
    expect(run({ all: ['anything'] }, user([], true))).toBe(true);
  });

  it('lets Admin through routes needing several permissions, even ones created later', () => {
    expect(run({ all: ['sites.read', 'future_module.export'] }, user([], true))).toBe(true);
    expect(run({ any: ['reports.view'] }, user([], true))).toBe(true);
  });

  it('does not extend the Admin bypass to anyone else', () => {
    expect(() => run({ all: ['sites.read'] }, user([], false))).toThrow(AppException);
  });

  it('rejects when no user was resolved', () => {
    expect(() => run({ all: ['a'] }, undefined)).toThrow(AppException);
  });
});

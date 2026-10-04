import { COMMON_ERRORS } from '../constants/common.constants.js';
import { AppException } from '../exceptions/app.exception.js';
import type { AuthUser } from '../../modules/auth/types/auth.type.js';
import { TENANT_ERRORS } from '../../modules/tenants/constants/tenants.constants.js';

/** A reference that may be a raw id or a populated document. */
export const refId = (ref: unknown): string => {
  if (ref && typeof ref === 'object' && '_id' in ref) {
    return String((ref as { _id: unknown })._id);
  }
  return String(ref);
};

export const isAdmin = (user: AuthUser): boolean => Boolean(user.role?.isAdmin);

/**
 * Tenant a list/read query must be limited to. Admins see everything (or one
 * tenant when they ask for it); everyone else is pinned to their own workspace.
 */
export function scopeTenant(
  user: AuthUser,
  requested?: string,
): string | undefined {
  if (isAdmin(user)) return requested;
  if (!user.tenant) throw new AppException(TENANT_ERRORS.NO_WORKSPACE);
  return user.tenant.id;
}

/** Tenant a new record belongs to: the caller's own, or (Admin only) the one named. */
export function tenantForCreate(user: AuthUser, requested?: string): string {
  if (isAdmin(user)) {
    if (!requested) throw new AppException(TENANT_ERRORS.TENANT_REQUIRED);
    return requested;
  }
  if (!user.tenant) throw new AppException(TENANT_ERRORS.NO_WORKSPACE);
  return user.tenant.id;
}

/** Hides another tenant's record behind a plain 404 rather than a 403. */
export function assertTenantAccess(user: AuthUser, ownerTenant: unknown): void {
  if (isAdmin(user)) return;
  if (!user.tenant || refId(ownerTenant) !== user.tenant.id) {
    throw new AppException(COMMON_ERRORS.NOT_FOUND);
  }
}

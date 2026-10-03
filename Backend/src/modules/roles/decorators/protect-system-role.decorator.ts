import { SetMetadata } from '@nestjs/common';
import { PROTECT_SYSTEM_ROLE_KEY } from '../constants/roles.constants.js';
import type { ProtectedRoleAction } from '../types/role.type.js';

/**
 * Marks a `:id` route as unavailable for system roles (checked by
 * `SystemRoleGuard`): `delete` blocks every system role, `permissions` blocks
 * only the Super Admin role, whose access is implicit.
 */
export const ProtectSystemRole = (action: ProtectedRoleAction) =>
  SetMetadata(PROTECT_SYSTEM_ROLE_KEY, action);

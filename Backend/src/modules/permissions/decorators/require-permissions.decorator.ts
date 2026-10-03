import { SetMetadata } from '@nestjs/common';
import {
  REQUIRE_ANY_PERMISSION_KEY,
  REQUIRE_PERMISSIONS_KEY,
} from '../constants/permissions.constants.js';

/** The caller must hold **every** listed permission. */
export const RequirePermissions = (...keys: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, keys);

/** The caller must hold **at least one** of the listed permissions. */
export const RequireAnyPermission = (...keys: string[]) =>
  SetMetadata(REQUIRE_ANY_PERMISSION_KEY, keys);

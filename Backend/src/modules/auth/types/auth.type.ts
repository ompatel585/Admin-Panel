import type { Request } from 'express';
import type {
  TenantPlan,
  TenantStatus,
} from '../../tenants/constants/tenants.constants.js';

export interface JwtPayload {
  sub: string;
  /** Issued-at, in seconds; added by the JWT library. */
  iat?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    isAdmin: boolean;
  } | null;
  /** The workspace the user belongs to; null for platform Admins. */
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: TenantPlan;
    status: TenantStatus;
  } | null;
  /** Keys of the active permissions the caller holds (empty for Admin; see `role.isAdmin`). */
  permissions: string[];
}

export type AuthenticatedRequest = Request & { user?: AuthUser };

import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    isSuperAdmin: boolean;
  } | null;
  /** Keys of the active permissions the caller holds (empty for Super Admin; see `role.isSuperAdmin`). */
  permissions: string[];
}

export type AuthenticatedRequest = Request & { user?: AuthUser };

import type { ListParams } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; isAdmin: boolean; isActive: boolean };
  tenant: { id: string; name: string; slug: string } | null;
  /** Ids of the permissions granted to this person directly, on top of their role. */
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** A single user, with those direct permissions spelled out. */
export interface UserDetail extends Omit<User, "permissions"> {
  permissions: { id: string; name: string; key: string; parent: string | null; isActive: boolean }[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: string;
  tenantId?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserListParams extends ListParams {
  roleId?: string;
  tenantId?: string;
  isActive?: boolean;
}

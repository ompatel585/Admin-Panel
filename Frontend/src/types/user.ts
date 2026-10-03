import type { ListParams } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; isSuperAdmin: boolean; isActive: boolean };
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserListParams extends ListParams {
  roleId?: string;
  isActive?: boolean;
}

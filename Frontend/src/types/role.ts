import type { ListParams } from "./api";

export interface RolePermissionRef {
  id: string;
  name: string;
  key: string;
  parent: string | null;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermissionRef[];
  isSuperAdmin: boolean;
  isDefault: boolean;
  isSystem: boolean;
  isActive: boolean;
}

export interface RoleOption {
  id: string;
  name: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
  isDefault?: boolean;
}

export type UpdateRoleRequest = Partial<CreateRoleRequest>;

export interface RoleListParams extends ListParams {
  isActive?: boolean;
}

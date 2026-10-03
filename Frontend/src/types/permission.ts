import type { ListParams } from "./api";

export interface Permission {
  id: string;
  name: string;
  key: string;
  description: string;
  /** Populated `{ id, name, key }` in list/detail responses, or null for a module. */
  parent: { id: string; name: string; key: string } | string | null;
  isActive: boolean;
  isSystem: boolean;
}

export interface PermissionNode {
  id: string;
  name: string;
  key: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  parent: string | null;
  children: PermissionNode[];
}

export interface CreatePermissionRequest {
  name: string;
  key: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface PermissionListParams extends ListParams {
  type?: "module" | "sub";
  parentId?: string;
  isActive?: boolean;
}

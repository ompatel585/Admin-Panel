export interface PermissionTreeNode {
  id: string;
  name: string;
  key: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  parent: string | null;
  children: PermissionTreeNode[];
}

export type PermissionTypeFilter = 'module' | 'sub';

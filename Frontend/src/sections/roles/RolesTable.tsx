"use client";

import { Badge, Button, DataTable, StatusBadge, uiStyles, type Column } from "@/components/ui";
import type { Role } from "@/types/role";

interface RolesTableProps {
  roles: Role[] | undefined;
  loading: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RolesTable({ roles, loading, canUpdate, canDelete, onEdit, onDelete }: RolesTableProps) {
  const columns: Column<Role>[] = [
    {
      header: "Role",
      render: (role) => (
        <div>
          <strong>{role.name}</strong>{" "}
          {role.isSystem && <Badge tone="warning">System</Badge>}{" "}
          {role.isDefault && <Badge tone="primary">Default</Badge>}
          {role.description && <div style={{ color: "var(--text-muted)" }}>{role.description}</div>}
        </div>
      ),
    },
    {
      header: "Permissions",
      render: (role) => (role.isSuperAdmin ? <Badge tone="primary">Everything</Badge> : <Badge>{role.permissions.length}</Badge>),
    },
    { header: "Status", render: (role) => <StatusBadge active={role.isActive} /> },
    {
      header: "",
      align: "right",
      render: (role) => (
        <div className={uiStyles.actions}>
          {canUpdate && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
              Edit
            </Button>
          )}
          {canDelete && !role.isSystem && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(role)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={roles}
      rowKey={(role) => role.id}
      loading={loading}
      emptyMessage="No roles found."
    />
  );
}

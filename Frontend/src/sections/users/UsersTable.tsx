"use client";

import { Badge, Button, DataTable, StatusBadge, uiStyles, type Column } from "@/components/ui";
import type { RoleOption } from "@/types/role";
import type { User } from "@/types/user";

interface UsersTableProps {
  users: User[] | undefined;
  loading: boolean;
  roleOptions: RoleOption[];
  currentUserId: string | undefined;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onChangeRole: (user: User, roleId: string) => void;
}

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "Never");

export function UsersTable({
  users,
  loading,
  roleOptions,
  currentUserId,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onToggleStatus,
  onChangeRole,
}: UsersTableProps) {
  const columns: Column<User>[] = [
    {
      header: "User",
      render: (user) => (
        <div>
          <strong>{user.name}</strong>
          {user.id === currentUserId && <> <Badge tone="primary">You</Badge></>}
          <div style={{ color: "var(--text-muted)" }}>{user.email}</div>
        </div>
      ),
    },
    {
      header: "Role",
      render: (user) =>
        canUpdate && user.id !== currentUserId ? (
          <select
            className={uiStyles.toolbarInput}
            style={{ minWidth: 150 }}
            value={user.role.id}
            aria-label={`Role for ${user.name}`}
            onChange={(event) => onChangeRole(user, event.target.value)}
          >
            {!roleOptions.some((option) => option.id === user.role.id) && (
              <option value={user.role.id}>{user.role.name}</option>
            )}
            {roleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        ) : (
          <Badge tone="primary">{user.role.name}</Badge>
        ),
    },
    { header: "Status", render: (user) => <StatusBadge active={user.isActive} /> },
    { header: "Last login", render: (user) => formatDate(user.lastLoginAt) },
    {
      header: "",
      align: "right",
      render: (user) => {
        const isSelf = user.id === currentUserId;
        return (
          <div className={uiStyles.actions}>
            {canUpdate && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                Edit
              </Button>
            )}
            {canUpdate && !isSelf && (
              <Button variant="ghost" size="sm" onClick={() => onToggleStatus(user)}>
                {user.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
            {canDelete && !isSelf && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(user)}>
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={users}
      rowKey={(user) => user.id}
      loading={loading}
      emptyMessage="No users match your filters."
    />
  );
}

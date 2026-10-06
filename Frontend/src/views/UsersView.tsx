"use client";

import { Pencil, Plus, Power, ShieldCheck, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableCard } from "@/components/shared/data-table-card";
import { RowActions } from "@/components/shared/row-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TenantFilter } from "@/components/shared/tenant-filter";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDateTime } from "@/lib/format";
import { UserFormDialog } from "@/sections/users/user-form-dialog";
import {
  useDeleteUserMutation,
  useGetRoleOptionsQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from "@/services/api";
import type { User } from "@/types/user";
import { succeeded } from "@/utils/safe-unwrap";

const ALL = "all";
type ModalState = { type: "create" } | { type: "edit"; user: User } | null;

export function UsersView() {
  const { user: me } = useAuth();
  const { can, isAdmin } = usePermissions();

  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState(ALL);
  const [tenantId, setTenantId] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { data } = useGetUsersQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    roleId: roleId === ALL ? undefined : roleId,
    tenantId: tenantId || undefined,
  });
  const { data: roles = [] } = useGetRoleOptionsQuery();
  // The Admin role can't be handed to anyone.
  const assignable = roles.filter((role) => !role.isAdmin);

  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [updateStatus] = useUpdateUserStatusMutation();
  const [updateRole] = useUpdateUserRoleMutation();

  const roleFilterItems = [{ value: ALL, label: "All roles" }, ...roles.map((role) => ({ value: role.id, label: role.name }))];

  const changeRole = (user: User, newRoleId: string) => {
    void succeeded(updateRole({ id: user.id, roleId: newRoleId }).unwrap());
  };

  const confirmDelete = async () => {
    if (toDelete && (await succeeded(deleteUser(toDelete.id).unwrap()))) setToDelete(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.users.read}>
      <PageHeader
        title="Users"
        description={isAdmin ? "Everyone who can sign in, across all workspaces." : "People in your workspace."}
      />

      <DataTableCard
        search={{
          value: search,
          placeholder: "Search by name or email",
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
        filters={
          <>
          <Select
            items={roleFilterItems}
            value={roleId}
            onValueChange={(next) => {
              setRoleId(next as string);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40" aria-label="Filter by role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TenantFilter
            value={tenantId}
            onChange={(next) => {
              setTenantId(next);
              setPage(1);
            }}
          />
          </>
        }
        action={
          can(PERMISSIONS.users.create) && (
            <Button onClick={() => setModal({ type: "create" })}>
              <Plus /> Add user
            </Button>
          )
        }
        isEmpty={data?.items.length === 0}
        empty={{ icon: Users, title: "No users found" }}
        meta={data?.meta}
        onPageChange={setPage}
      >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User info</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((user) => {
                const isSelf = user.id === me?.id;
                const canUpdate = can(PERMISSIONS.users.update);
                const canChangeRole = canUpdate && !isSelf;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} size="md" />
                        <div className="min-w-0">
                          <p className="font-medium">
                            {user.name} {isSelf && <Badge variant="secondary">You</Badge>}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.tenant ? (
                        <>
                          <p>{user.tenant.name}</p>
                          <p className="font-mono text-xs text-muted-foreground" title="Workspace (tenant) id">
                            {user.tenant.id}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No workspace</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.isActive ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell>
                      {canChangeRole ? (
                        <Select
                          items={assignable.map((role) => ({ value: role.id, label: role.name }))}
                          value={user.role.id}
                          onValueChange={(next) => changeRole(user, next as string)}
                        >
                          <SelectTrigger size="sm" className="w-36" aria-label={`Role for ${user.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {assignable.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">{user.role.name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</TableCell>
                    <TableCell>
                      <RowActions
                        subject={user.name}
                        actions={[
                          {
                            label: user.isActive ? "Deactivate" : "Activate",
                            icon: Power,
                            tone: user.isActive ? "warning" : "success",
                            hidden: !canUpdate || isSelf,
                            onClick: () => void succeeded(updateStatus({ id: user.id, isActive: !user.isActive }).unwrap()),
                          },
                          {
                            label: "Edit",
                            icon: Pencil,
                            tone: "primary",
                            hidden: !canUpdate,
                            onClick: () => setModal({ type: "edit", user }),
                          },
                          {
                            label: "Permissions",
                            icon: ShieldCheck,
                            hidden: !isAdmin || !canUpdate,
                            href: `${ROUTES.users}/${user.id}/permissions`,
                          },
                          {
                            label: "Delete",
                            icon: Trash2,
                            tone: "danger",
                            hidden: !can(PERMISSIONS.users.delete) || isSelf,
                            onClick: () => setToDelete(user),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </DataTableCard>

      {modal && <UserFormDialog user={modal.type === "edit" ? modal.user : null} onClose={() => setModal(null)} />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete user"
        description={
          <>
            Permanently delete <strong>{toDelete?.name}</strong> ({toDelete?.email})? This cannot be undone.
          </>
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </RequirePermission>
  );
}

"use client";

import { MoreHorizontal, Plus, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Can } from "@/components/guards/Can";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TenantFilter } from "@/components/shared/tenant-filter";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
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
        actions={
          <Can permission={PERMISSIONS.users.create}>
            <Button onClick={() => setModal({ type: "create" })}>
              <Plus /> New user
            </Button>
          </Can>
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <Input
            className="max-w-xs"
            placeholder="Search name or email…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
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
        </div>

        {data && data.items.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                {isAdmin && <TableHead>Workspace</TableHead>}
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((user) => {
                const isSelf = user.id === me?.id;
                const canChangeRole = can(PERMISSIONS.users.update) && !isSelf;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">
                        {user.name} {isSelf && <Badge variant="secondary">You</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    {isAdmin && <TableCell>{user.tenant?.name ?? <span className="text-muted-foreground">Platform</span>}</TableCell>}
                    <TableCell>
                      {canChangeRole ? (
                        <Select
                          items={assignable.map((role) => ({ value: role.id, label: role.name }))}
                          value={user.role.id}
                          onValueChange={(next) => changeRole(user, next as string)}
                        >
                          <SelectTrigger size="sm" className="w-32" aria-label={`Role for ${user.name}`}>
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
                    <TableCell>
                      <StatusBadge status={user.isActive ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                      {isAdmin && can(PERMISSIONS.users.update) && (
                        <Link
                          href={`${ROUTES.users}/${user.id}/permissions`}
                          aria-label={`Permissions for ${user.name}`}
                          title="Individual permissions"
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                        >
                          <ShieldCheck />
                        </Link>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`} />}>
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {can(PERMISSIONS.users.update) && (
                            <DropdownMenuItem onClick={() => setModal({ type: "edit", user })}>Edit</DropdownMenuItem>
                          )}
                          {can(PERMISSIONS.users.update) && !isSelf && (
                            <DropdownMenuItem
                              onClick={() => void succeeded(updateStatus({ id: user.id, isActive: !user.isActive }).unwrap())}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          )}
                          {can(PERMISSIONS.users.delete) && !isSelf && (
                            <DropdownMenuItem variant="destructive" onClick={() => setToDelete(user)}>
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {data && <DataPagination meta={data.meta} onPageChange={setPage} />}
      </Card>

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

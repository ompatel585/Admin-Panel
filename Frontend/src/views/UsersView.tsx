"use client";

import { useState } from "react";
import { Can } from "@/components/guards/Can";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { Button, Card, ConfirmDialog, PageHeader, Pagination, uiStyles } from "@/components/ui";
import { PERMISSIONS } from "@/constants/permissions";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { UserFormModal } from "@/sections/users/UserFormModal";
import { UsersTable } from "@/sections/users/UsersTable";
import {
  useDeleteUserMutation,
  useGetRoleOptionsQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from "@/services/api";
import type { User } from "@/types/user";
import { succeeded } from "@/utils/safe-unwrap";

type ModalState = { type: "create" } | { type: "edit"; user: User } | null;

export function UsersView() {
  const { user: me } = useAuth();
  const { can } = usePermissions();

  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { data, isFetching } = useGetUsersQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    roleId: roleId || undefined,
  });
  const { data: roleOptions = [] } = useGetRoleOptionsQuery();

  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [updateStatus] = useUpdateUserStatusMutation();
  const [updateRole] = useUpdateUserRoleMutation();

  const confirmDelete = async () => {
    if (toDelete && (await succeeded(deleteUser(toDelete.id).unwrap()))) setToDelete(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.users.read}>
      <PageHeader
        title="Users"
        subtitle="Manage who can sign in and what role they hold."
        actions={
          <Can permission={PERMISSIONS.users.create}>
            <Button onClick={() => setModal({ type: "create" })}>New user</Button>
          </Can>
        }
      />

      <Card padded={false}>
        <div className={uiStyles.toolbar}>
          <input
            className={uiStyles.toolbarInput}
            placeholder="Search name or email…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <select
            className={uiStyles.toolbarInput}
            value={roleId}
            aria-label="Filter by role"
            onChange={(event) => {
              setRoleId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <UsersTable
          users={data?.items}
          loading={isFetching}
          roleOptions={roleOptions}
          currentUserId={me?.id}
          canUpdate={can(PERMISSIONS.users.update)}
          canDelete={can(PERMISSIONS.users.delete)}
          onEdit={(user) => setModal({ type: "edit", user })}
          onDelete={setToDelete}
          onToggleStatus={(user) => void succeeded(updateStatus({ id: user.id, isActive: !user.isActive }).unwrap())}
          onChangeRole={(user, newRoleId) => void succeeded(updateRole({ id: user.id, roleId: newRoleId }).unwrap())}
        />
        {data && <Pagination meta={data.meta} onPageChange={setPage} />}
      </Card>

      {modal && (
        <UserFormModal
          open
          user={modal.type === "edit" ? modal.user : null}
          roleOptions={roleOptions}
          onClose={() => setModal(null)}
        />
      )}

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

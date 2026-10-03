"use client";

import { useState } from "react";
import { Can } from "@/components/guards/Can";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { Button, Card, ConfirmDialog, PageHeader, Pagination, uiStyles } from "@/components/ui";
import { PERMISSIONS } from "@/constants/permissions";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleFormModal } from "@/sections/roles/RoleFormModal";
import { RolesTable } from "@/sections/roles/RolesTable";
import { useDeleteRoleMutation, useGetRolesQuery } from "@/services/api";
import type { Role } from "@/types/role";
import { succeeded } from "@/utils/safe-unwrap";

type ModalState = { type: "create" } | { type: "edit"; role: Role } | null;

export function RolesView() {
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { data, isFetching } = useGetRolesQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sortOrder: "asc",
  });
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const confirmDelete = async () => {
    if (toDelete && (await succeeded(deleteRole(toDelete.id).unwrap()))) setToDelete(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.roles.read}>
      <PageHeader
        title="Roles"
        subtitle="Bundle permissions into roles and assign them to users."
        actions={
          <Can permission={PERMISSIONS.roles.create}>
            <Button onClick={() => setModal({ type: "create" })}>New role</Button>
          </Can>
        }
      />

      <Card padded={false}>
        <div className={uiStyles.toolbar}>
          <input
            className={uiStyles.toolbarInput}
            placeholder="Search roles…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <RolesTable
          roles={data?.items}
          loading={isFetching}
          canUpdate={can(PERMISSIONS.roles.update)}
          canDelete={can(PERMISSIONS.roles.delete)}
          onEdit={(role) => setModal({ type: "edit", role })}
          onDelete={setToDelete}
        />
        {data && <Pagination meta={data.meta} onPageChange={setPage} />}
      </Card>

      {modal && (
        <RoleFormModal open role={modal.type === "edit" ? modal.role : null} onClose={() => setModal(null)} />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete role"
        description={
          <>
            Delete the role <strong>{toDelete?.name}</strong>? Roles that are still assigned to users can&apos;t be
            deleted.
          </>
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </RequirePermission>
  );
}

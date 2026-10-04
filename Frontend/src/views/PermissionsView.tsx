"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Can } from "@/components/guards/Can";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/constants/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionFormDialog, type PermissionModalState } from "@/sections/permissions/permission-form-dialog";
import { PermissionsTree } from "@/sections/permissions/permissions-tree";
import { useDeletePermissionMutation, useGetPermissionTreeQuery } from "@/services/api";
import type { PermissionNode } from "@/types/permission";
import { succeeded } from "@/utils/safe-unwrap";

export function PermissionsView() {
  const { can } = usePermissions();
  const { data: tree, isFetching } = useGetPermissionTreeQuery();
  const [modal, setModal] = useState<PermissionModalState | null>(null);
  const [toDelete, setToDelete] = useState<PermissionNode | null>(null);
  const [deletePermission, { isLoading: deleting }] = useDeletePermissionMutation();

  const confirmDelete = async () => {
    if (toDelete && (await succeeded(deletePermission(toDelete.id).unwrap()))) setToDelete(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.permissions.read}>
      <PageHeader
        title="Permissions"
        description="Modules and their sub-permissions. Anything you add here can be granted to roles."
        actions={
          <Can permission={PERMISSIONS.permissions.create}>
            <Button onClick={() => setModal({ type: "create-module" })}>
              <Plus /> New module
            </Button>
          </Can>
        }
      />

      <PermissionsTree
        tree={tree}
        loading={isFetching}
        canCreate={can(PERMISSIONS.permissions.create)}
        canUpdate={can(PERMISSIONS.permissions.update)}
        canDelete={can(PERMISSIONS.permissions.delete)}
        onAddSub={(parent) => setModal({ type: "create-sub", parent })}
        onEdit={(permission) => setModal({ type: "edit", permission })}
        onDelete={setToDelete}
      />

      {modal && <PermissionFormDialog state={modal} onClose={() => setModal(null)} />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete permission"
        description={
          <>
            Delete <strong>{toDelete?.key}</strong>? Permissions that have sub-permissions or are assigned to a role can&apos;t be
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

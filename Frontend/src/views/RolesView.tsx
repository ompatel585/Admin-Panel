"use client";

import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableCard } from "@/components/shared/data-table-card";
import { RowActions } from "@/components/shared/row-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleFormDialog } from "@/sections/roles/role-form-dialog";
import { useDeleteRoleMutation, useGetRolesQuery } from "@/services/api";
import type { Role } from "@/types/role";
import { succeeded } from "@/utils/safe-unwrap";

type ModalState = { type: "create" } | { type: "edit"; role: Role } | null;

export function RolesView() {
  const { can, isAdmin } = usePermissions();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { data } = useGetRolesQuery({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined, sortOrder: "asc" });
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const confirmDelete = async () => {
    if (toDelete && (await succeeded(deleteRole(toDelete.id).unwrap()))) setToDelete(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.roles.read}>
      <PageHeader title="Roles" description="What each role is allowed to do. Open a role's shield to choose its permissions." />

      <DataTableCard
        search={{
          value: search,
          placeholder: "Search by name",
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
        action={
          isAdmin && (
            <Button onClick={() => setModal({ type: "create" })}>
              <Plus /> Add role
            </Button>
          )
        }
        isEmpty={data?.items.length === 0}
        empty={{ icon: ShieldCheck, title: "No roles found" }}
        meta={data?.meta}
        onPageChange={setPage}
      >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <p className="font-medium">{role.name}</p>
                    {role.description && <p className="max-w-md truncate text-xs text-muted-foreground">{role.description}</p>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={role.isActive ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{role.permissions.length}</TableCell>
                  <TableCell>
                    <RowActions
                      subject={role.name}
                      actions={[
                        {
                          label: "Edit",
                          icon: Pencil,
                          tone: "primary",
                          hidden: !isAdmin,
                          onClick: () => setModal({ type: "edit", role }),
                        },
                        {
                          label: "Permissions",
                          icon: ShieldCheck,
                          hidden: !can(PERMISSIONS.roles.update) || role.isAdmin,
                          href: `${ROUTES.roles}/${role.id}/permissions`,
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          tone: "danger",
                          hidden: !isAdmin || role.isSystem,
                          onClick: () => setToDelete(role),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </DataTableCard>

      {modal && <RoleFormDialog role={modal.type === "edit" ? modal.role : null} onClose={() => setModal(null)} />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete role"
        description={
          <>
            Delete <strong>{toDelete?.name}</strong>? Roles that are assigned to users can&apos;t be deleted.
          </>
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </RequirePermission>
  );
}

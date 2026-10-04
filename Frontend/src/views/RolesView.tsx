"use client";

import { Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
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

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search by name"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setModal({ type: "create" })}>
              <Plus /> Add role
            </Button>
          )}
        </div>

        {data && data.items.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No roles found" />
        ) : (
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
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <Button variant="ghost" size="icon-sm" className="text-primary" aria-label={`Edit ${role.name}`} onClick={() => setModal({ type: "edit", role })}>
                          <Pencil />
                        </Button>
                      )}
                      {can(PERMISSIONS.roles.update) && !role.isAdmin && (
                        <Link
                          href={`${ROUTES.roles}/${role.id}/permissions`}
                          aria-label={`Permissions for ${role.name}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                        >
                          <ShieldCheck />
                        </Link>
                      )}
                      {isAdmin && !role.isSystem && (
                        <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label={`Delete ${role.name}`} onClick={() => setToDelete(role)}>
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {data && <DataPagination meta={data.meta} onPageChange={setPage} />}
      </Card>

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

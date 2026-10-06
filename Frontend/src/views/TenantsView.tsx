"use client";

import { Building2, Pencil, Plus, Power, Trash2 } from "lucide-react";
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
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDate } from "@/lib/format";
import { TenantFormDialog } from "@/sections/tenants/tenant-form-dialog";
import { useDeleteTenantMutation, useGetTenantsQuery, useUpdateTenantStatusMutation } from "@/services/api";
import type { Tenant } from "@/types/tenant";
import { succeeded } from "@/utils/safe-unwrap";

type ModalState = { type: "create" } | { type: "edit"; tenant: Tenant } | null;

const usage = (used: number | undefined, max: number) => `${used ?? 0} / ${max}`;

export function TenantsView() {
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<Tenant | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { data } = useGetTenantsQuery({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined });
  const [updateStatus] = useUpdateTenantStatusMutation();
  const [deleteTenant, { isLoading: deleting }] = useDeleteTenantMutation();

  const confirmDelete = async () => {
    if (toDelete && (await succeeded(deleteTenant(toDelete.id).unwrap()))) setToDelete(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.tenants.list}>
      <PageHeader title="Workspaces" description="Every customer on the platform, with their plan and how much of it they use." />

      <DataTableCard
        search={{
          value: search,
          placeholder: "Search workspaces",
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
        action={
          can(PERMISSIONS.tenants.create) && (
            <Button onClick={() => setModal({ type: "create" })}>
              <Plus /> Add workspace
            </Button>
          )
        }
        isEmpty={data?.items.length === 0}
        empty={{ icon: Building2, title: "No workspaces found" }}
        meta={data?.meta}
        onPageChange={setPage}
      >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Websites</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="font-mono text-xs text-muted-foreground" title="Workspace (tenant) id">
                      {tenant.id}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tenant.plan} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell className="text-right">{usage(tenant.usage?.sites, tenant.limits.maxSites)}</TableCell>
                  <TableCell className="text-right">{tenant.usage?.users ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tenant.createdAt)}</TableCell>
                  <TableCell>
                    <RowActions
                      subject={tenant.name}
                      actions={[
                        {
                          label: tenant.status === "active" ? "Suspend" : "Reactivate",
                          icon: Power,
                          tone: tenant.status === "active" ? "warning" : "success",
                          hidden: !can(PERMISSIONS.tenants.suspend),
                          onClick: () =>
                            void succeeded(
                              updateStatus({ id: tenant.id, status: tenant.status === "active" ? "suspended" : "active" }).unwrap(),
                            ),
                        },
                        {
                          label: "Edit",
                          icon: Pencil,
                          tone: "primary",
                          hidden: !can(PERMISSIONS.tenants.update),
                          onClick: () => setModal({ type: "edit", tenant }),
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          tone: "danger",
                          hidden: !can(PERMISSIONS.tenants.delete),
                          onClick: () => setToDelete(tenant),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </DataTableCard>

      {modal && <TenantFormDialog tenant={modal.type === "edit" ? modal.tenant : null} onClose={() => setModal(null)} />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete workspace"
        description={
          <>
            Permanently delete <strong>{toDelete?.name}</strong> together with its users, websites and crawl jobs? This
            cannot be undone.
          </>
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </RequirePermission>
  );
}

"use client";

import { Building2, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { Can } from "@/components/guards/Can";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
      <PageHeader
        title="Workspaces"
        description="Every customer on the platform, with their plan and how much of it they use."
        actions={
          <Can permission={PERMISSIONS.tenants.create}>
            <Button onClick={() => setModal({ type: "create" })}>
              <Plus /> New workspace
            </Button>
          </Can>
        }
      />

      <Card className="gap-0 py-0">
        <div className="border-b p-3">
          <Input
            className="max-w-xs"
            placeholder="Search workspaces…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {data && data.items.length === 0 ? (
          <EmptyState icon={Building2} title="No workspaces found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Websites</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.slug}</p>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${tenant.name}`} />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {can(PERMISSIONS.tenants.update) && (
                          <DropdownMenuItem onClick={() => setModal({ type: "edit", tenant })}>Edit</DropdownMenuItem>
                        )}
                        {can(PERMISSIONS.tenants.suspend) && (
                          <DropdownMenuItem
                            onClick={() =>
                              void succeeded(
                                updateStatus({ id: tenant.id, status: tenant.status === "active" ? "suspended" : "active" }).unwrap(),
                              )
                            }
                          >
                            {tenant.status === "active" ? "Suspend" : "Reactivate"}
                          </DropdownMenuItem>
                        )}
                        {can(PERMISSIONS.tenants.delete) && (
                          <DropdownMenuItem variant="destructive" onClick={() => setToDelete(tenant)}>
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {data && <DataPagination meta={data.meta} onPageChange={setPage} />}
      </Card>

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

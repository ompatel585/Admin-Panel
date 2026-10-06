"use client";

import { Globe, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { DataTableCard } from "@/components/shared/data-table-card";
import { RowActions } from "@/components/shared/row-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TenantFilter } from "@/components/shared/tenant-filter";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS } from "@/constants/permissions";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCount, formatDateTime } from "@/lib/format";
import { SiteFormDialog } from "@/sections/sites/site-form-dialog";
import { useCrawlSiteMutation, useDeleteSiteMutation, useGetSitesQuery } from "@/services/api";
import type { Site } from "@/types/site";
import { succeeded } from "@/utils/safe-unwrap";

const ACTIVE_POLL_MS = 4000;
type ModalState = { type: "add" } | { type: "edit"; site: Site } | null;

export function SitesView() {
  const { can, isAdmin } = usePermissions();
  const [search, setSearch] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<Site | null>(null);
  const [pollMs, setPollMs] = useState(0);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { data, isFetching } = useGetSitesQuery(
    { page, limit: PAGE_SIZE, search: debouncedSearch || undefined, tenantId: tenantId || undefined },
    { pollingInterval: pollMs },
  );
  const [crawlSite] = useCrawlSiteMutation();
  const [deleteSite, { isLoading: deleting }] = useDeleteSiteMutation();

  // Poll only while something is being crawled, so an idle page stays quiet.
  const wantedPollMs = data?.items.some((site) => site.activeJob) ? ACTIVE_POLL_MS : 0;
  if (wantedPollMs !== pollMs) setPollMs(wantedPollMs);

  const confirmDelete = async () => {
    if (toDelete && (await succeeded(deleteSite(toDelete.id).unwrap()))) setToDelete(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.sites.read}>
      <PageHeader title="Websites" description="Websites that are crawled, chunked and embedded for your knowledge base." />

      <DataTableCard
        search={{
          value: search,
          placeholder: "Search name or address",
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
        filters={
          <TenantFilter
            value={tenantId}
            onChange={(next) => {
              setTenantId(next);
              setPage(1);
            }}
          />
        }
        action={
          can(PERMISSIONS.sites.create) && (
            <Button onClick={() => setModal({ type: "add" })}>
              <Plus /> Add website
            </Button>
          )
        }
        isEmpty={data?.items.length === 0}
        empty={{
          icon: Globe,
          title: debouncedSearch || tenantId ? "No websites match" : "No websites yet",
          description: debouncedSearch || tenantId ? "Try a different search." : "Add your first website to build a knowledge base.",
        }}
        meta={data?.meta}
        onPageChange={setPage}
      >
          <Table className={isFetching && !data ? "opacity-60" : undefined}>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                {isAdmin && <TableHead>Workspace</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Pages</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead>Last crawled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    <p className="font-medium">{site.name}</p>
                    <p className="max-w-64 truncate text-xs text-muted-foreground">{site.url}</p>
                  </TableCell>
                  {isAdmin && <TableCell>{site.tenant?.name}</TableCell>}
                  <TableCell>
                    <div className="grid w-32 gap-1.5">
                      <StatusBadge status={site.status} className="w-fit" />
                      {site.activeJob && site.activeJob.status === "running" && (
                        <div className="grid gap-1">
                          <Progress value={site.activeJob.progress} />
                          <span className="text-xs capitalize text-muted-foreground">
                            {site.activeJob.stage ?? "starting"} · {site.activeJob.progress}%
                          </span>
                        </div>
                      )}
                      {site.status === "failed" && site.stats.lastError && (
                        <span className="line-clamp-2 text-xs text-destructive" title={site.stats.lastError}>
                          {site.stats.lastError}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCount(site.stats.pages)}</TableCell>
                  <TableCell className="text-right">{formatCount(site.stats.chunks)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {site.stats.lastCrawledAt ? formatDateTime(site.stats.lastCrawledAt) : "Never"}
                  </TableCell>
                  <TableCell>
                    <RowActions
                      subject={site.name}
                      actions={[
                        {
                          label: "Edit",
                          icon: Pencil,
                          tone: "primary",
                          hidden: !can(PERMISSIONS.sites.update),
                          onClick: () => setModal({ type: "edit", site }),
                        },
                        {
                          label: site.activeJob ? "Crawl in progress" : "Re-crawl now",
                          icon: RefreshCw,
                          hidden: !can(PERMISSIONS.sites.crawl),
                          disabled: Boolean(site.activeJob),
                          onClick: () => void succeeded(crawlSite(site.id).unwrap()),
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          tone: "danger",
                          hidden: !can(PERMISSIONS.sites.delete),
                          onClick: () => setToDelete(site),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </DataTableCard>

      {modal && <SiteFormDialog site={modal.type === "edit" ? modal.site : null} onClose={() => setModal(null)} />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete website"
        description={
          <>
            Remove <strong>{toDelete?.name}</strong> and everything indexed from it?
          </>
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </RequirePermission>
  );
}

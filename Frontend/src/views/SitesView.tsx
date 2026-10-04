"use client";

import { Globe, MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Can } from "@/components/guards/Can";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TenantFilter } from "@/components/shared/tenant-filter";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
      <PageHeader
        title="Websites"
        description="Websites that are crawled, chunked and embedded for your knowledge base."
        actions={
          <Can permission={PERMISSIONS.sites.create}>
            <Button onClick={() => setModal({ type: "add" })}>
              <Plus /> Add website
            </Button>
          </Can>
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <Input
            className="max-w-xs"
            placeholder="Search name or address…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <TenantFilter
            value={tenantId}
            onChange={(next) => {
              setTenantId(next);
              setPage(1);
            }}
          />
        </div>

        {data && data.items.length === 0 ? (
          <EmptyState
            icon={Globe}
            title={debouncedSearch || tenantId ? "No websites match" : "No websites yet"}
            description={debouncedSearch || tenantId ? "Try a different search." : "Add your first website to build a knowledge base."}
          />
        ) : (
          <Table className={isFetching && !data ? "opacity-60" : undefined}>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                {isAdmin && <TableHead>Workspace</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Pages</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead>Last crawled</TableHead>
                <TableHead className="w-10" />
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
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${site.name}`} />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {can(PERMISSIONS.sites.crawl) && (
                          <DropdownMenuItem
                            disabled={Boolean(site.activeJob)}
                            onClick={() => void succeeded(crawlSite(site.id).unwrap())}
                          >
                            <RefreshCw /> Re-crawl now
                          </DropdownMenuItem>
                        )}
                        {can(PERMISSIONS.sites.update) && (
                          <DropdownMenuItem onClick={() => setModal({ type: "edit", site })}>Edit</DropdownMenuItem>
                        )}
                        {can(PERMISSIONS.sites.delete) && (
                          <DropdownMenuItem variant="destructive" onClick={() => setToDelete(site)}>
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

"use client";

import { ListChecks, X } from "lucide-react";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTableCard } from "@/components/shared/data-table-card";
import { RowActions } from "@/components/shared/row-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TenantFilter } from "@/components/shared/tenant-filter";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERMISSIONS } from "@/constants/permissions";
import { PAGE_SIZE } from "@/constants/ui";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCount, formatDateTime } from "@/lib/format";
import { useCancelCrawlJobMutation, useGetCrawlJobsQuery } from "@/services/api";
import type { CrawlJob, JobStatus } from "@/types/crawl-job";
import { succeeded } from "@/utils/safe-unwrap";

const ACTIVE_POLL_MS = 4000;
const ALL = "all";
const STATUS_OPTIONS = [
  { value: ALL, label: "All statuses" },
  { value: "queued", label: "Queued" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export function CrawlJobsView() {
  const { can, isAdmin } = usePermissions();
  const [status, setStatus] = useState<string>(ALL);
  const [tenantId, setTenantId] = useState("");
  const [page, setPage] = useState(1);
  const [toCancel, setToCancel] = useState<CrawlJob | null>(null);
  const [pollMs, setPollMs] = useState(0);

  const { data } = useGetCrawlJobsQuery(
    {
      page,
      limit: PAGE_SIZE,
      status: status === ALL ? undefined : (status as JobStatus),
      tenantId: tenantId || undefined,
    },
    { pollingInterval: pollMs },
  );
  const [cancelJob, { isLoading: cancelling }] = useCancelCrawlJobMutation();

  // Poll only while a job is queued or running.
  const active = data?.items.some((job) => job.status === "queued" || job.status === "running");
  const wantedPollMs = active ? ACTIVE_POLL_MS : 0;
  if (wantedPollMs !== pollMs) setPollMs(wantedPollMs);

  const confirmCancel = async () => {
    if (toCancel && (await succeeded(cancelJob(toCancel.id).unwrap()))) setToCancel(null);
  };

  return (
    <RequirePermission permission={PERMISSIONS.crawlJobs.read}>
      <PageHeader title="Crawl jobs" description="Every crawl, chunk and embed run, with live progress." />

      <DataTableCard
        filters={
          <>
          <Select
            items={STATUS_OPTIONS}
            value={status}
            onValueChange={(next) => {
              setStatus(next as string);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
          </>
        }
        isEmpty={data?.items.length === 0}
        empty={{ icon: ListChecks, title: "No crawl jobs", description: "Jobs appear when a website is added or re-crawled." }}
        meta={data?.meta}
        onPageChange={setPage}
      >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                {isAdmin && <TableHead>Workspace</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Pages</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((job) => {
                const active = job.status === "queued" || job.status === "running";
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <p className="font-medium">{job.site?.name ?? "Deleted website"}</p>
                      <p className="text-xs capitalize text-muted-foreground">{job.trigger} run</p>
                    </TableCell>
                    {isAdmin && <TableCell>{job.tenant?.name}</TableCell>}
                    <TableCell>
                      <div className="grid w-36 gap-1.5">
                        <StatusBadge status={job.status} className="w-fit" />
                        {job.status === "running" && (
                          <div className="grid gap-1">
                            <Progress value={job.progress} />
                            <span className="text-xs capitalize text-muted-foreground">
                              {job.stage ?? "starting"} · {job.progress}%
                            </span>
                          </div>
                        )}
                        {job.error && (
                          <span className="line-clamp-2 text-xs text-destructive" title={job.error}>
                            {job.error}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCount(job.pagesCrawled)}
                      {job.pagesDiscovered > 0 && <span className="text-muted-foreground"> / {formatCount(job.pagesDiscovered)}</span>}
                    </TableCell>
                    <TableCell className="text-right">{formatCount(job.chunksCreated)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {job.startedAt ? formatDateTime(job.startedAt) : formatDateTime(job.createdAt)}
                    </TableCell>
                    <TableCell>
                      <RowActions
                        subject={job.site?.name ?? "job"}
                        actions={[
                          {
                            label: "Cancel",
                            icon: X,
                            tone: "danger",
                            hidden: !active || !can(PERMISSIONS.crawlJobs.cancel),
                            onClick: () => setToCancel(job),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </DataTableCard>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel crawl job"
        description={
          <>
            Stop the crawl of <strong>{toCancel?.site?.name}</strong>? Pages already indexed stay available.
          </>
        }
        confirmLabel="Cancel job"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </RequirePermission>
  );
}

"use client";

import { Building2, Database, Globe, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageSpinner } from "@/components/shared/page-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { formatCount, formatDateTime } from "@/lib/format";
import { useGetCurrentTenantQuery, useGetDashboardStatsQuery } from "@/services/api";

const REFRESH_MS = 20_000;

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | null }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold leading-tight">{formatCount(value ?? 0)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanUsage() {
  const { data: tenant } = useGetCurrentTenantQuery();
  if (!tenant?.usage) return null;

  const rows = [
    { label: "Websites", used: tenant.usage.sites, max: tenant.limits.maxSites },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Plan usage <StatusBadge status={tenant.plan} />
        </CardTitle>
        <CardDescription>Up to {formatCount(tenant.limits.maxPagesPerSite)} pages per website.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1.5">
            <div className="flex justify-between text-sm">
              <span>{row.label}</span>
              <span className="text-muted-foreground">
                {row.used} / {row.max}
              </span>
            </div>
            <Progress value={Math.min(100, (row.used / row.max) * 100)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboardStatsQuery(undefined, { pollingInterval: REFRESH_MS });

  if (isLoading || !data) return <PageSpinner />;
  const platform = data.scope === "platform";

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name.split(" ")[0] ?? ""}`}
        description={platform ? "Everything happening across the platform." : "How your websites and crawls are doing."}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {platform && <StatCard icon={Building2} label="Workspaces" value={data.totals.tenants} />}
        {platform && <StatCard icon={Users} label="Users" value={data.totals.users} />}
        <StatCard icon={Globe} label="Websites" value={data.totals.sites} />
        <StatCard icon={Database} label="Pages indexed" value={data.totals.pages} />
        <StatCard icon={Database} label="Chunks embedded" value={data.totals.chunks} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent crawls</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentJobs.length === 0 ? (
              <EmptyState icon={Globe} title="No crawls yet" description="Add a website to start indexing it." />
            ) : (
              <ul className="divide-y">
                {data.recentJobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{job.site?.name ?? "Deleted website"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {platform && job.tenant ? `${job.tenant.name} · ` : ""}
                        {formatDateTime(job.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </li>
                ))}
              </ul>
            )}
            <Link href={ROUTES.crawlJobs} className="mt-2 inline-block text-sm text-primary hover:underline">
              View all crawl jobs
            </Link>
          </CardContent>
        </Card>

        {platform ? (
          <Card>
            <CardHeader>
              <CardTitle>New workspaces</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {data.recentTenants.length === 0 && <p className="text-sm text-muted-foreground">No workspaces yet.</p>}
              {data.recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{tenant.name}</span>
                  <StatusBadge status={tenant.plan} />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <PlanUsage />
        )}
      </div>
    </>
  );
}

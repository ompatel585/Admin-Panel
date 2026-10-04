export interface DashboardStats {
  scope: "platform" | "workspace";
  totals: {
    sites: number;
    pages: number;
    chunks: number;
    /** Platform scope only. */
    tenants: number | null;
    users: number | null;
  };
  sitesByStatus: Record<string, number>;
  jobsByStatus: Record<string, number>;
  recentJobs: {
    id: string;
    status: string;
    stage: string | null;
    progress: number;
    createdAt: string;
    site: { name: string; url: string } | null;
    tenant: { name: string } | null;
  }[];
  recentTenants: { id: string; name: string; plan: string; createdAt: string }[];
}

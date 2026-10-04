import type { ListParams } from "./api";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type JobStage = "crawling" | "chunking" | "embedding";

export interface CrawlJob {
  id: string;
  tenant: { id: string; name: string; slug: string };
  site: { id: string; name: string; url: string; domain: string };
  status: JobStatus;
  stage: JobStage | null;
  trigger: "initial" | "manual" | "schedule";
  progress: number;
  pagesDiscovered: number;
  pagesCrawled: number;
  chunksCreated: number;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface CrawlJobListParams extends ListParams {
  tenantId?: string;
  siteId?: string;
  status?: JobStatus;
}

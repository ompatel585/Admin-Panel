import type { ListParams } from "./api";

export type SiteStatus = "pending" | "crawling" | "indexing" | "ready" | "failed";
export type RecrawlSchedule = "off" | "daily" | "weekly";

export interface CrawlSettings {
  maxPages: number;
  maxDepth: number;
  includePaths: string[];
  excludePaths: string[];
  respectRobots: boolean;
  recrawl: RecrawlSchedule;
}

export interface Site {
  id: string;
  tenant: { id: string; name: string; slug: string };
  name: string;
  url: string;
  domain: string;
  status: SiteStatus;
  crawl: CrawlSettings;
  stats: { pages: number; chunks: number; lastCrawledAt: string | null; lastError: string | null };
  /** The queued or running crawl, if any. */
  activeJob: { id: string; status: string; stage: string | null; progress: number } | null;
  createdAt: string;
}

export interface SiteOption {
  id: string;
  name: string;
  url: string;
  tenantId: string;
}

export interface CreateSiteRequest {
  tenantId?: string;
  name: string;
  url: string;
  crawl?: Partial<CrawlSettings>;
}

export interface UpdateSiteRequest {
  name?: string;
  crawl?: Partial<CrawlSettings>;
}

export interface SiteListParams extends ListParams {
  tenantId?: string;
  status?: SiteStatus;
}

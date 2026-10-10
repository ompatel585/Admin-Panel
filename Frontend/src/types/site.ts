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

export interface WidgetTheme {
  accent: string;
  accentForeground: string;
  surface: string;
  raised: string;
  foreground: string;
  muted: string;
  border: string;
  radius: number;
  font: string;
}

export interface WidgetCopy {
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;
  offlineMessage: string;
  avatarText: string;
}

export type LauncherPosition = "bottom-right" | "bottom-left";

export interface WidgetLauncher {
  position: LauncherPosition;
  offset: number;
  width: number;
  height: number;
}

export interface WidgetFeatures {
  streaming: boolean;
  showSources: boolean;
}

/** What the admin can restyle; the bot and RAG settings are not part of this panel. */
export interface WidgetSettings {
  theme: WidgetTheme;
  copy: WidgetCopy;
  launcher: WidgetLauncher;
  features: WidgetFeatures;
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
  settings: WidgetSettings;
  settingsVersion: number;
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

export interface UpdateWidgetRequest {
  theme?: Partial<WidgetTheme>;
  copy?: Partial<WidgetCopy>;
  launcher?: Partial<WidgetLauncher>;
  features?: Partial<WidgetFeatures>;
}

export interface SiteListParams extends ListParams {
  tenantId?: string;
  status?: SiteStatus;
}

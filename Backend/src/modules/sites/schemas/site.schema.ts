import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';
import {
  RECRAWL_SCHEDULES,
  SITE_DEFAULTS,
  WIDGET_DEFAULTS,
  SITE_STATUSES,
  type RecrawlSchedule,
  type SiteStatus,
} from '../constants/sites.constants.js';

@Schema({ _id: false })
export class CrawlSettings {
  @Prop({ default: SITE_DEFAULTS.maxPages })
  maxPages: number;

  @Prop({ default: SITE_DEFAULTS.maxDepth })
  maxDepth: number;

  @Prop({ type: [String], default: [] })
  includePaths: string[];

  @Prop({ type: [String], default: [] })
  excludePaths: string[];

  @Prop({ default: true })
  respectRobots: boolean;

  @Prop({ type: String, enum: RECRAWL_SCHEDULES, default: 'off' })
  recrawl: RecrawlSchedule;
}

@Schema({ _id: false })
export class SiteStats {
  @Prop({ default: 0 })
  pages: number;

  @Prop({ default: 0 })
  chunks: number;

  @Prop({ type: Date, default: null })
  lastCrawledAt: Date | null;

  @Prop({ type: String, default: null })
  lastError: string | null;
}

@Schema({ _id: false })
export class WidgetTheme {
  @Prop({ default: WIDGET_DEFAULTS.theme.accent })
  accent: string;
  @Prop({ default: WIDGET_DEFAULTS.theme.accentForeground })
  accentForeground: string;
  @Prop({ default: WIDGET_DEFAULTS.theme.surface })
  surface: string;
  @Prop({ default: WIDGET_DEFAULTS.theme.raised })
  raised: string;
  @Prop({ default: WIDGET_DEFAULTS.theme.foreground })
  foreground: string;
  @Prop({ default: WIDGET_DEFAULTS.theme.muted })
  muted: string;
  @Prop({ default: WIDGET_DEFAULTS.theme.border })
  border: string;
  @Prop({ default: WIDGET_DEFAULTS.theme.radius })
  radius: number;
  @Prop({ default: WIDGET_DEFAULTS.theme.font })
  font: string;
}

@Schema({ _id: false })
export class WidgetCopy {
  @Prop({ default: WIDGET_DEFAULTS.copy.title })
  title: string;
  @Prop({ default: WIDGET_DEFAULTS.copy.subtitle })
  subtitle: string;
  @Prop({ default: WIDGET_DEFAULTS.copy.greeting })
  greeting: string;
  @Prop({ default: WIDGET_DEFAULTS.copy.placeholder })
  placeholder: string;
  @Prop({ default: WIDGET_DEFAULTS.copy.offlineMessage })
  offlineMessage: string;
  @Prop({ default: WIDGET_DEFAULTS.copy.avatarText })
  avatarText: string;
}

@Schema({ _id: false })
export class WidgetLauncher {
  @Prop({ type: String, enum: ['bottom-right', 'bottom-left'], default: WIDGET_DEFAULTS.launcher.position })
  position: string;
  @Prop({ default: WIDGET_DEFAULTS.launcher.offset })
  offset: number;
  @Prop({ default: WIDGET_DEFAULTS.launcher.width })
  width: number;
  @Prop({ default: WIDGET_DEFAULTS.launcher.height })
  height: number;
}

@Schema({ _id: false })
export class WidgetFeatures {
  @Prop({ default: WIDGET_DEFAULTS.features.streaming })
  streaming: boolean;
  @Prop({ default: WIDGET_DEFAULTS.features.showSources })
  showSources: boolean;
}

@Schema({ _id: false })
export class WidgetBot {
  @Prop({ default: WIDGET_DEFAULTS.bot.systemPrompt })
  systemPrompt: string;
  /** Platform team only: it controls AI cost. */
  @Prop({ type: String, default: null })
  llmModel: string | null;
  @Prop({ default: WIDGET_DEFAULTS.bot.temperature, min: 0, max: 2 })
  temperature: number;
  @Prop({ default: WIDGET_DEFAULTS.bot.maxOutputTokens })
  maxOutputTokens: number;
}

@Schema({ _id: false })
export class WidgetRag {
  @Prop({ type: String, default: null })
  embeddingModel: string | null;
  @Prop({ default: WIDGET_DEFAULTS.rag.topK })
  topK: number;
  @Prop({ default: WIDGET_DEFAULTS.rag.minScore })
  minScore: number;
  @Prop({ default: WIDGET_DEFAULTS.rag.fallbackMessage })
  fallbackMessage: string;
}

/** Platform team only: per-site rate limits. */
@Schema({ _id: false })
export class WidgetLimits {
  @Prop({ default: WIDGET_DEFAULTS.limits.messagesPerMinute })
  messagesPerMinute: number;
  @Prop({ default: WIDGET_DEFAULTS.limits.messagesPerDay })
  messagesPerDay: number;
}

/** Everything `/widget/config` returns, embedded so one read serves it. */
@Schema({ _id: false })
export class SiteSettings {
  @Prop({ type: WidgetTheme, default: () => ({}) })
  theme: WidgetTheme;
  @Prop({ type: WidgetCopy, default: () => ({}) })
  copy: WidgetCopy;
  @Prop({ type: WidgetLauncher, default: () => ({}) })
  launcher: WidgetLauncher;
  @Prop({ type: WidgetFeatures, default: () => ({}) })
  features: WidgetFeatures;
  @Prop({ type: WidgetBot, default: () => ({}) })
  bot: WidgetBot;
  @Prop({ type: WidgetRag, default: () => ({}) })
  rag: WidgetRag;
  @Prop({ type: WidgetLimits, default: () => ({}) })
  limits: WidgetLimits;
}

/** A website whose content is crawled, chunked and embedded for a tenant. */
@Schema({ timestamps: true })
export class Site {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Tenant', required: true })
  tenant: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  /** Normalised start URL, e.g. `https://example.com/docs`. */
  @Prop({ required: true, trim: true })
  url: string;

  /** Host only, e.g. `example.com`. */
  @Prop({ required: true, lowercase: true })
  domain: string;

  @Prop({ type: String, enum: SITE_STATUSES, default: 'pending', index: true })
  status: SiteStatus;

  @Prop({ type: CrawlSettings, default: () => ({}) })
  crawl: CrawlSettings;

  @Prop({ type: SiteStats, default: () => ({}) })
  stats: SiteStats;

  /** `st_...`, random; goes in the embed snippet. Unique across all sites. */
  @Prop({ type: String })
  publicToken: string;

  /** SHA-256 of the `sk_...` secret, which is shown once at creation. */
  @Prop({ type: String, select: false })
  secretKeyHash: string;

  /** Exact origins allowed to load the widget, e.g. `https://acme.com`. */
  @Prop({ type: [String], default: [] })
  allowedOrigins: string[];

  @Prop({ type: SiteSettings, default: () => ({}) })
  settings: SiteSettings;

  /** Increases on every settings save; lets widgets bust their cache. */
  @Prop({ default: 1 })
  settingsVersion: number;
}

export type SiteDocument = HydratedDocument<Site>;
export const SiteSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(Site),
);
SiteSchema.index({ tenant: 1, url: 1, deletedAt: 1 }, { unique: true });
SiteSchema.index({ tenant: 1, status: 1 });
// Partial so sites written before tokens existed do not collide before the backfill runs.
SiteSchema.index(
  { publicToken: 1 },
  { unique: true, partialFilterExpression: { publicToken: { $type: 'string' } } },
);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';
import {
  RECRAWL_SCHEDULES,
  SITE_DEFAULTS,
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
}

export type SiteDocument = HydratedDocument<Site>;
export const SiteSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(Site),
);
SiteSchema.index({ tenant: 1, url: 1 }, { unique: true });

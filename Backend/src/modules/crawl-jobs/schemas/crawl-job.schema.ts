import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';
import {
  JOB_STAGES,
  JOB_STATUSES,
  JOB_TRIGGERS,
  type JobStage,
  type JobStatus,
  type JobTrigger,
} from '../constants/crawl-jobs.constants.js';

/** One crawl -> chunk -> embed run for a site. Progress is reported by the external pipeline. */
@Schema({ timestamps: true })
export class CrawlJob {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  })
  tenant: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Site',
    required: true,
    index: true,
  })
  site: Types.ObjectId;

  @Prop({ type: String, enum: JOB_STATUSES, default: 'queued', index: true })
  status: JobStatus;

  @Prop({ type: String, enum: JOB_STAGES, default: null })
  stage: JobStage | null;

  @Prop({ type: String, enum: JOB_TRIGGERS, default: 'manual' })
  trigger: JobTrigger;

  /** 0-100. */
  @Prop({ default: 0 })
  progress: number;

  @Prop({ default: 0 })
  pagesDiscovered: number;

  @Prop({ default: 0 })
  pagesCrawled: number;

  @Prop({ default: 0 })
  chunksCreated: number;

  @Prop({ type: String, default: null })
  error: string | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  requestedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  finishedAt: Date | null;
}

export type CrawlJobDocument = HydratedDocument<CrawlJob>;
export const CrawlJobSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(CrawlJob),
);

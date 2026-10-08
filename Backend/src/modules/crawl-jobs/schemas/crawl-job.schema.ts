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

  /** Last sign of life from the pipeline; lets a job whose worker died be spotted. */
  @Prop({ type: Date, default: null })
  heartbeatAt: Date | null;

  /**
   * Set when the job ends (finish + `JOB_RETENTION_DAYS`). MongoDB then removes
   * it for good: job history is retention data, not a record to soft-delete.
   * Null while the job is active, which a TTL index ignores.
   */
  @Prop({ type: Date, default: null, expires: 0 })
  expireAt: Date | null;
}

export type CrawlJobDocument = HydratedDocument<CrawlJob>;
export const CrawlJobSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(CrawlJob),
);
CrawlJobSchema.index({ status: 1, createdAt: 1 }); // claiming the oldest queued job
CrawlJobSchema.index({ site: 1, status: 1 }); // "does this site have an active job?"
CrawlJobSchema.index({ tenant: 1, createdAt: -1 }); // a workspace's job list

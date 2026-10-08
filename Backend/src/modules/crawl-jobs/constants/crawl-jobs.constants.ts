import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const JOB_STATUSES = [
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Pipeline stages a running job moves through. */
export const JOB_STAGES = ['crawling', 'chunking', 'embedding'] as const;
export type JobStage = (typeof JOB_STAGES)[number];

export const JOB_TRIGGERS = ['initial', 'manual', 'schedule'] as const;
export type JobTrigger = (typeof JOB_TRIGGERS)[number];

export const ACTIVE_JOB_STATUSES: JobStatus[] = ['queued', 'running'];

/** How long a finished job is kept before MongoDB removes it. */
export const JOB_RETENTION_DAYS = 90;

export const PIPELINE_KEY_HEADER = 'x-pipeline-key';

export const JOB_ERRORS = defineErrors({
  NOT_FOUND: {
    code: 'JOB_NOT_FOUND',
    message: 'Crawl job not found',
    status: HttpStatus.NOT_FOUND,
  },
  NOT_CANCELLABLE: {
    code: 'JOB_NOT_CANCELLABLE',
    message: 'Only queued or running jobs can be cancelled',
    status: HttpStatus.CONFLICT,
  },
  PIPELINE_KEY_INVALID: {
    code: 'PIPELINE_KEY_INVALID',
    message: 'Invalid pipeline key',
    status: HttpStatus.UNAUTHORIZED,
  },
});

export const JOB_MESSAGES = {
  FETCHED: 'Crawl jobs fetched',
  CANCELLED: 'Crawl job cancelled',
} as const;

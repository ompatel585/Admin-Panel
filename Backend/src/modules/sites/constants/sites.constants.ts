import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const SITE_STATUSES = [
  'pending',
  'crawling',
  'indexing',
  'ready',
  'failed',
] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

export const RECRAWL_SCHEDULES = ['off', 'daily', 'weekly'] as const;
export type RecrawlSchedule = (typeof RECRAWL_SCHEDULES)[number];

export const SITE_DEFAULTS = {
  maxPages: 100,
  maxDepth: 3,
} as const;

export const SITE_ERRORS = defineErrors({
  NOT_FOUND: {
    code: 'SITE_NOT_FOUND',
    message: 'Website not found',
    status: HttpStatus.NOT_FOUND,
  },
  URL_TAKEN: {
    code: 'SITE_URL_TAKEN',
    message: 'This website has already been added to the workspace',
    status: HttpStatus.CONFLICT,
  },
  LIMIT_REACHED: {
    code: 'SITE_LIMIT_REACHED',
    message: 'Your plan website limit has been reached',
    status: HttpStatus.FORBIDDEN,
  },
  PAGE_LIMIT_EXCEEDED: {
    code: 'SITE_PAGE_LIMIT_EXCEEDED',
    message: 'The page limit exceeds what your plan allows',
    status: HttpStatus.BAD_REQUEST,
  },
  CRAWL_ACTIVE: {
    code: 'SITE_CRAWL_ACTIVE',
    message: 'A crawl is already queued or running for this website',
    status: HttpStatus.CONFLICT,
  },
});

export const SITE_MESSAGES = {
  FETCHED: 'Websites fetched',
  CREATED: 'Website added. Crawling will start shortly',
  UPDATED: 'Website updated',
  DELETED: 'Website deleted',
  CRAWL_QUEUED: 'Crawl queued',
} as const;

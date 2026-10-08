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

export const SITE_TOKEN_PREFIX = 'st_';
export const SITE_SECRET_PREFIX = 'sk_';

/** Starting widget settings for a new site (the doc lists the fields, not the values). */
export const WIDGET_DEFAULTS = {
  theme: {
    accent: '#4f46e5',
    accentForeground: '#ffffff',
    surface: '#ffffff',
    raised: '#f4f4f5',
    foreground: '#18181b',
    muted: '#71717a',
    border: '#e4e4e7',
    radius: 12,
    font: 'system-ui',
  },
  copy: {
    title: 'Ask us anything',
    subtitle: 'Answers from our website',
    greeting: 'Hi! How can I help you today?',
    placeholder: 'Type your question...',
    offlineMessage: 'We are offline right now. Please try again later.',
    avatarText: 'AI',
  },
  launcher: { position: 'bottom-right', offset: 20, width: 56, height: 56 },
  features: { streaming: true, showSources: true },
  bot: {
    systemPrompt:
      'Answer using only the provided website content. If the answer is not there, say so.',
    temperature: 0.2,
    maxOutputTokens: 512,
  },
  rag: {
    topK: 5,
    minScore: 0.35,
    fallbackMessage:
      "I couldn't find that on this website. Please contact us for help.",
  },
  limits: { messagesPerMinute: 10, messagesPerDay: 200 },
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

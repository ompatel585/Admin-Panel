import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { AppException } from '../../common/exceptions/app.exception.js';
import { sortDirection } from '../../common/utils/query.util.js';
import {
  assertTenantAccess,
  refId,
  scopeTenant,
} from '../../common/utils/tenant-scope.util.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import {
  ACTIVE_JOB_STATUSES,
  JOB_ERRORS,
  JOB_RETENTION_DAYS,
  type JobStage,
} from './constants/crawl-jobs.constants.js';
import { CrawlJobsRepository } from './crawl-jobs.repository.js';
import type { ListCrawlJobsQueryDto } from './dto/list-crawl-jobs-query.dto.js';
import type { ReportJobDto } from './dto/report-job.dto.js';
import type { CrawlJob, CrawlJobDocument } from './schemas/crawl-job.schema.js';

const POPULATE = [
  { path: 'site', select: 'name url domain' },
  { path: 'tenant', select: 'name slug' },
];
const SCHEDULER_INTERVAL_MS = 5 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** When MongoDB should remove a job that has just ended. */
const expiryFrom = (finishedAt: Date) =>
  new Date(finishedAt.getTime() + JOB_RETENTION_DAYS * DAY_MS);

const INDEXING_STAGES: JobStage[] = ['chunking', 'embedding'];

@Injectable()
export class CrawlJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CrawlJobsService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly repository: CrawlJobsRepository) {}

  /** Queues scheduled re-crawls; the pipeline then picks them up like any other job. */
  onModuleInit(): void {
    this.timer = setInterval(
      () => void this.queueDueRecrawls(),
      SCHEDULER_INTERVAL_MS,
    );
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  findAll(user: AuthUser, query: ListCrawlJobsQueryDto) {
    const filter: QueryFilter<CrawlJob> = {};
    const tenant = scopeTenant(user, query.tenantId);
    if (tenant) filter.tenant = tenant;
    if (query.siteId) filter.site = query.siteId;
    if (query.status) filter.status = query.status;

    return this.repository.findPage(filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: sortDirection(query.sortOrder) },
      populate: POPULATE,
    });
  }

  async findById(user: AuthUser, id: string): Promise<CrawlJobDocument> {
    const job = await this.repository.findById(id, POPULATE);
    if (!job) throw new AppException(JOB_ERRORS.NOT_FOUND);
    assertTenantAccess(user, job.tenant);
    return job;
  }

  async cancel(user: AuthUser, id: string): Promise<CrawlJobDocument> {
    const job = await this.findById(user, id);
    if (!ACTIVE_JOB_STATUSES.includes(job.status)) {
      throw new AppException(JOB_ERRORS.NOT_CANCELLABLE);
    }

    const now = new Date();
    const updated = await this.repository.updateById(
      id,
      { $set: { status: 'cancelled', finishedAt: now, expireAt: expiryFrom(now) } },
      POPULATE,
    );
    if (!updated) throw new AppException(JOB_ERRORS.NOT_FOUND);
    await this.settleCancelled(refId(job.site));
    return updated;
  }

  /** Pipeline: take the next queued job (with the site config it needs), or null. */
  async claim() {
    const job = await this.repository.claimNext();
    if (!job) return null;

    // Claiming is the first sign of life.
    await this.repository.updateById(job._id, {
      $set: { heartbeatAt: new Date() },
    });
    const site = await this.repository.findSite(job.site);
    if (!site) {
      const now = new Date();
      await this.repository.updateById(job._id, {
        $set: {
          status: 'failed',
          error: 'Website no longer exists',
          finishedAt: now,
          expireAt: expiryFrom(now),
        },
      });
      return null;
    }
    await this.repository.updateSite(site._id, {
      $set: { status: 'crawling' },
    });

    return {
      jobId: String(job._id),
      tenantId: String(job.tenant),
      siteId: String(site._id),
      url: site.url,
      domain: site.domain,
      crawl: site.crawl,
    };
  }

  /** Pipeline: progress / completion / failure report. */
  async report(id: string, dto: ReportJobDto) {
    const job = await this.repository.findById(id);
    if (!job) throw new AppException(JOB_ERRORS.NOT_FOUND);
    // A job cancelled from the panel stays cancelled; tell the pipeline to stop.
    if (!ACTIVE_JOB_STATUSES.includes(job.status)) {
      return { jobId: id, status: job.status };
    }

    const now = new Date();
    const set: Partial<CrawlJob> = { heartbeatAt: now };
    if (dto.stage) set.stage = dto.stage;
    if (dto.progress !== undefined) set.progress = dto.progress;
    if (dto.pagesDiscovered !== undefined) {
      set.pagesDiscovered = dto.pagesDiscovered;
    }
    if (dto.pagesCrawled !== undefined) set.pagesCrawled = dto.pagesCrawled;
    if (dto.chunksCreated !== undefined) set.chunksCreated = dto.chunksCreated;

    const status = dto.status ?? job.status;
    set.status = status;
    if (!job.startedAt) set.startedAt = new Date();
    if (status === 'completed') {
      set.progress = 100;
      set.stage = null;
      set.finishedAt = now;
      set.expireAt = expiryFrom(now);
    }
    if (status === 'failed') {
      set.error = dto.error ?? 'Pipeline reported a failure';
      set.finishedAt = now;
      set.expireAt = expiryFrom(now);
    }

    const updated = await this.repository.updateById(id, { $set: set });
    if (!updated) throw new AppException(JOB_ERRORS.NOT_FOUND);
    await this.syncSite(updated);
    return { jobId: id, status: updated.status };
  }

  private async syncSite(job: CrawlJobDocument): Promise<void> {
    if (job.status === 'completed') {
      await this.repository.updateSite(job.site, {
        $set: {
          status: 'ready',
          'stats.pages': job.pagesCrawled,
          'stats.chunks': job.chunksCreated,
          'stats.lastCrawledAt': new Date(),
          'stats.lastError': null,
        },
      });
      return;
    }
    if (job.status === 'failed') {
      await this.repository.updateSite(job.site, {
        $set: { status: 'failed', 'stats.lastError': job.error },
      });
      return;
    }
    const indexing = job.stage !== null && INDEXING_STAGES.includes(job.stage);
    await this.repository.updateSite(job.site, {
      $set: { status: indexing ? 'indexing' : 'crawling' },
    });
  }

  /** Cancelled: fall back to whatever was indexed before this run. */
  private async settleCancelled(siteId: string): Promise<void> {
    const site = await this.repository.findSite(siteId);
    await this.repository.updateSite(siteId, {
      $set: { status: site && site.stats.pages > 0 ? 'ready' : 'pending' },
    });
  }

  private async queueDueRecrawls(): Promise<void> {
    try {
      const sites = await this.repository.findSitesDueForRecrawl(new Date());
      for (const site of sites) {
        if (await this.repository.hasActiveJob(site._id)) continue;
        await this.repository.queue(site.tenant, site._id, 'schedule');
        await this.repository.updateSite(site._id, {
          $set: { status: 'pending' },
        });
        this.logger.log(`Queued scheduled re-crawl for ${site.url}`);
      }
    } catch (error) {
      this.logger.error('Scheduled re-crawl check failed', error as Error);
    }
  }
}

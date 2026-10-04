import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type UpdateQuery } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { Site } from '../sites/schemas/site.schema.js';
import {
  ACTIVE_JOB_STATUSES,
  type JobTrigger,
} from './constants/crawl-jobs.constants.js';
import { CrawlJob } from './schemas/crawl-job.schema.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CrawlJobsRepository extends BaseRepository<CrawlJob> {
  constructor(
    @InjectModel(CrawlJob.name) jobModel: Model<CrawlJob>,
    // A job's progress is mirrored onto its site (status and stats).
    @InjectModel(Site.name) private readonly siteModel: Model<Site>,
  ) {
    super(jobModel);
  }

  queue(
    tenant: Types.ObjectId | string,
    site: Types.ObjectId | string,
    trigger: JobTrigger,
    requestedBy: Types.ObjectId | string | null = null,
  ) {
    return this.create({
      tenant: tenant as Types.ObjectId,
      site: site as Types.ObjectId,
      trigger,
      requestedBy: requestedBy as Types.ObjectId | null,
    });
  }

  hasActiveJob(site: Types.ObjectId | string): Promise<boolean> {
    return this.exists({ site, status: { $in: ACTIVE_JOB_STATUSES } });
  }

  /** Atomically takes the oldest queued job so two pipeline workers never share one. */
  claimNext() {
    return this.model.findOneAndUpdate(
      { status: 'queued' },
      { $set: { status: 'running', stage: 'crawling', startedAt: new Date() } },
      { sort: { createdAt: 1 }, returnDocument: 'after' },
    );
  }

  updateSite(id: Types.ObjectId | string, update: UpdateQuery<Site>) {
    return this.siteModel.updateOne({ _id: id }, update);
  }

  findSite(id: Types.ObjectId | string) {
    return this.siteModel.findById(id);
  }

  /** Sites whose scheduled recrawl is due. */
  findSitesDueForRecrawl(now: Date) {
    return this.siteModel.find({
      status: { $in: ['ready', 'failed'] },
      $or: [
        {
          'crawl.recrawl': 'daily',
          'stats.lastCrawledAt': { $lte: new Date(now.getTime() - DAY_MS) },
        },
        {
          'crawl.recrawl': 'weekly',
          'stats.lastCrawledAt': { $lte: new Date(now.getTime() - 7 * DAY_MS) },
        },
      ],
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { CrawlJob } from '../crawl-jobs/schemas/crawl-job.schema.js';
import { Site } from './schemas/site.schema.js';

@Injectable()
export class SitesRepository extends BaseRepository<Site> {
  constructor(
    @InjectModel(Site.name) siteModel: Model<Site>,
    // Written only to remove a website's job history along with it.
    @InjectModel(CrawlJob.name) private readonly jobModel: Model<CrawlJob>,
  ) {
    super(siteModel);
  }

  findByUrl(tenant: string | Types.ObjectId, url: string) {
    return this.findOne({ tenant, url });
  }

  countForTenant(tenant: string | Types.ObjectId): Promise<number> {
    return this.count({ tenant });
  }

  deleteJobs(site: string | Types.ObjectId) {
    return this.jobModel.deleteMany({ site });
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from '../sites/schemas/site.schema.js';
import { CrawlJobsController } from './crawl-jobs.controller.js';
import { CrawlJobsRepository } from './crawl-jobs.repository.js';
import { CrawlJobsService } from './crawl-jobs.service.js';
import { CrawlJob, CrawlJobSchema } from './schemas/crawl-job.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrawlJob.name, schema: CrawlJobSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
  ],
  controllers: [CrawlJobsController],
  providers: [CrawlJobsService, CrawlJobsRepository],
  exports: [CrawlJobsService, CrawlJobsRepository],
})
export class CrawlJobsModule {}

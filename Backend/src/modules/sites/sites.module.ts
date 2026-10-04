import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlJobsModule } from '../crawl-jobs/crawl-jobs.module.js';
import {
  CrawlJob,
  CrawlJobSchema,
} from '../crawl-jobs/schemas/crawl-job.schema.js';
import { TenantsModule } from '../tenants/tenants.module.js';
import { Site, SiteSchema } from './schemas/site.schema.js';
import { SitesController } from './sites.controller.js';
import { SitesRepository } from './sites.repository.js';
import { SitesService } from './sites.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: CrawlJob.name, schema: CrawlJobSchema },
    ]),
    CrawlJobsModule,
    TenantsModule,
  ],
  controllers: [SitesController],
  providers: [SitesService, SitesRepository],
  exports: [SitesService, SitesRepository],
})
export class SitesModule {}

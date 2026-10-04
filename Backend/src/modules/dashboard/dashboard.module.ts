import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CrawlJob,
  CrawlJobSchema,
} from '../crawl-jobs/schemas/crawl-job.schema.js';
import { Role, RoleSchema } from '../roles/schemas/role.schema.js';
import { Site, SiteSchema } from '../sites/schemas/site.schema.js';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: CrawlJob.name, schema: CrawlJobSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

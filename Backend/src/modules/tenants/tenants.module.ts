import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CrawlJob,
  CrawlJobSchema,
} from '../crawl-jobs/schemas/crawl-job.schema.js';
import { RolesModule } from '../roles/roles.module.js';
import { Role, RoleSchema } from '../roles/schemas/role.schema.js';
import { Site, SiteSchema } from '../sites/schemas/site.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { Tenant, TenantSchema } from './schemas/tenant.schema.js';
import { TenantsController } from './tenants.controller.js';
import { TenantsRepository } from './tenants.repository.js';
import { TenantsSeeder } from './tenants.seeder.js';
import { TenantsService } from './tenants.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Site.name, schema: SiteSchema },
      { name: User.name, schema: UserSchema },
      { name: CrawlJob.name, schema: CrawlJobSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    RolesModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository, TenantsSeeder],
  exports: [TenantsService, TenantsRepository],
})
export class TenantsModule {}

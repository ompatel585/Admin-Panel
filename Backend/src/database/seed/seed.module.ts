import { Module } from '@nestjs/common';
import { PermissionsModule } from '../../modules/permissions/permissions.module.js';
import { RolesModule } from '../../modules/roles/roles.module.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [PermissionsModule, RolesModule],
  providers: [SeedService],
})
export class SeedModule {}

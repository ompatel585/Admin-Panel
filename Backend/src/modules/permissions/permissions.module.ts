import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { PermissionsController } from './permissions.controller.js';
import { PermissionsRepository } from './permissions.repository.js';
import { PermissionsSeeder } from './permissions.seeder.js';
import { PermissionsService } from './permissions.service.js';
import { Permission, PermissionSchema } from './schemas/permission.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsRepository,
    PermissionsGuard,
    PermissionsSeeder,
  ],
  exports: [
    PermissionsService,
    PermissionsRepository,
    PermissionsGuard,
    PermissionsSeeder,
  ],
})
export class PermissionsModule {}

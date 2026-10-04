import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { RolesController } from './roles.controller.js';
import { RolesRepository } from './roles.repository.js';
import { RolesSeeder } from './roles.seeder.js';
import { RolesService } from './roles.service.js';
import { Role, RoleSchema } from './schemas/role.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    PermissionsModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, RolesSeeder],
  exports: [RolesService, RolesRepository, RolesSeeder],
})
export class RolesModule {}

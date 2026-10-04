import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsModule } from '../tenants/tenants.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { PreventSelfActionGuard } from './guards/prevent-self-action.guard.js';
import { User, UserSchema } from './schemas/user.schema.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RolesModule,
    PermissionsModule,
    TenantsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PreventSelfActionGuard],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PermissionsRepository } from '../permissions/permissions.repository.js';
import { PermissionsSeeder } from '../permissions/permissions.seeder.js';
import { RolesRepository } from './roles.repository.js';
import { ROLE_SEEDS, type RoleSeed } from './seeds/roles.seed.js';

/** Creates the Admin and User roles once; never edits a role that exists. */
@Injectable()
export class RolesSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesSeeder.name);

  constructor(
    private readonly repository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly permissionsSeeder: PermissionsSeeder,
  ) {}

  private run?: Promise<void>;

  onApplicationBootstrap(): Promise<void> {
    return this.seed();
  }

  /** Memoised so dependants (tenants) can await it without running it twice. */
  seed(): Promise<void> {
    this.run ??= this.seedAll();
    return this.run;
  }

  private async seedAll(): Promise<void> {
    // The default permission keys must exist before roles can reference them.
    await this.permissionsSeeder.seed();

    const migrated = await this.repository.migrateLegacySuperAdmin();
    if (migrated > 0) {
      this.logger.log(`Migrated ${migrated} legacy Super Admin role(s) to Admin`);
    }
    for (const role of ROLE_SEEDS) {
      await this.seedRole(role);
    }
    // Roles created before `isHidden` existed: the super admin stays private.
    await this.repository.hideAdminRoles();
  }

  private async seedRole(seed: RoleSeed): Promise<void> {
    if (
      (await this.repository.findByName(seed.name)) ||
      (await this.repository.findByKey(seed.key))
    ) {
      return;
    }

    const permissions = await this.permissionsRepository
      .find({ key: { $in: seed.permissions } })
      .select('_id')
      .exec();

    await this.repository.create({
      name: seed.name,
      key: seed.key,
      scope: seed.scope,
      description: seed.description,
      isAdmin: seed.isAdmin,
      isHidden: seed.isHidden,
      isDefault: seed.isDefault,
      isSystem: true,
      permissions: permissions.map((permission) => permission._id),
    });
    this.logger.log(`Seeded role "${seed.name}"`);
  }
}

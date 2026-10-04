import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RolesSeeder } from '../roles/roles.seeder.js';
import { TenantsRepository } from './tenants.repository.js';
import { TenantsService } from './tenants.service.js';

/**
 * Upgrades accounts created before workspaces existed: every non-admin user
 * without a workspace gets one of their own. Idempotent.
 */
@Injectable()
export class TenantsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(TenantsSeeder.name);

  constructor(
    private readonly repository: TenantsRepository,
    private readonly tenants: TenantsService,
    private readonly rolesSeeder: RolesSeeder,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Admin roles must be settled first, or admins would be given workspaces.
    await this.rolesSeeder.seed();

    const orphans = await this.repository.findUsersWithoutWorkspace();
    for (const user of orphans) {
      const tenant = await this.tenants.create({ name: `${user.name} workspace` });
      await this.repository.assignWorkspace(user._id, tenant._id);
      this.logger.log(`Created workspace for existing user "${user.name}"`);
    }
  }
}

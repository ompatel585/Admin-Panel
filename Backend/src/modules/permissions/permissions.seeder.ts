import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository.js';
import {
  PERMISSION_SEEDS,
  RETIRED_PERMISSION_MODULES,
  type PermissionModuleSeed,
} from './seeds/permissions.seed.js';

/**
 * Idempotent: creates the permissions that are missing and never touches one
 * an admin has since edited. `seed()` is memoised so other seeders (roles) can
 * await it without running it twice.
 */
@Injectable()
export class PermissionsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionsSeeder.name);
  private run?: Promise<void>;

  constructor(private readonly repository: PermissionsRepository) {}

  onApplicationBootstrap(): Promise<void> {
    return this.seed();
  }

  seed(): Promise<void> {
    this.run ??= this.seedAll();
    return this.run;
  }

  private async seedAll(): Promise<void> {
    const retired = await this.repository.retireModules(RETIRED_PERMISSION_MODULES);
    if (retired > 0) this.logger.log(`Removed ${retired} retired permission(s)`);
    for (const entry of PERMISSION_SEEDS) {
      await this.seedModule(entry);
    }
  }

  private async seedModule(entry: PermissionModuleSeed): Promise<void> {
    let parent = await this.repository.findByKey(entry.key);
    if (!parent) {
      parent = await this.repository.create({
        key: entry.key,
        name: entry.name,
        description: entry.description,
        scope: entry.scope ?? 'company',
        group: entry.key,
        parent: null,
        isSystem: true,
      });
      this.logger.log(`Seeded permission module "${entry.key}"`);
    }

    for (const child of entry.children) {
      if (await this.repository.findByKey(child.key)) continue;
      await this.repository.create({
        key: child.key,
        name: child.name,
        description: child.description,
        scope: child.scope ?? entry.scope ?? 'company',
        group: entry.key,
        parent: parent._id,
        isSystem: true,
      });
    }
  }
}

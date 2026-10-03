import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  DEFAULT_PERMISSION_CATALOG,
  type CatalogEntry,
} from '../../modules/permissions/constants/permissions.constants.js';
import { PermissionsRepository } from '../../modules/permissions/permissions.repository.js';
import { SYSTEM_ROLES } from '../../modules/roles/constants/roles.constants.js';
import { RolesRepository } from '../../modules/roles/roles.repository.js';

/**
 * Idempotent bootstrap: creates what is missing (default permission catalog,
 * system roles) and never touches anything an admin has since edited.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly permissions: PermissionsRepository,
    private readonly roles: RolesRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const entry of DEFAULT_PERMISSION_CATALOG) {
      await this.seedPermissionModule(entry);
    }
    await this.seedSystemRoles();
  }

  private async seedPermissionModule(entry: CatalogEntry): Promise<void> {
    let parent = await this.permissions.findByKey(entry.key);
    if (!parent) {
      parent = await this.permissions.create({
        key: entry.key,
        name: entry.name,
        description: entry.description,
        parent: null,
        isSystem: true,
      });
      this.logger.log(`Seeded permission module "${entry.key}"`);
    }

    for (const child of entry.children) {
      if (await this.permissions.findByKey(child.key)) continue;
      await this.permissions.create({
        key: child.key,
        name: child.name,
        description: child.description,
        parent: parent._id,
        isSystem: true,
      });
    }
  }

  private async seedSystemRoles(): Promise<void> {
    if (!(await this.roles.findSuperAdmin())) {
      await this.roles.create({
        ...SYSTEM_ROLES.SUPER_ADMIN,
        isSuperAdmin: true,
        isSystem: true,
      });
      this.logger.log(`Seeded role "${SYSTEM_ROLES.SUPER_ADMIN.name}"`);
    }

    if (!(await this.roles.findDefault())) {
      const existing = await this.roles.findByName(SYSTEM_ROLES.USER.name);
      if (existing) {
        await this.roles.updateById(existing._id, {
          $set: { isDefault: true },
        });
      } else {
        await this.roles.create({
          ...SYSTEM_ROLES.USER,
          isDefault: true,
          isSystem: true,
        });
        this.logger.log(`Seeded role "${SYSTEM_ROLES.USER.name}"`);
      }
    }
  }
}

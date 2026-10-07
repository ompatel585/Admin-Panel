import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

/**
 * Uniqueness now includes `deletedAt` (so a soft-deleted row doesn't block
 * re-creating the same email, role name, ...). Databases created earlier still
 * hold the old single-field unique indexes, which would keep blocking that, so
 * they are dropped once. Mongoose builds the new compound indexes itself.
 */
const LEGACY_UNIQUE_INDEXES: Record<string, string> = {
  users: 'email_1',
  roles: 'name_1',
  permissions: 'key_1',
  tenants: 'slug_1',
  sites: 'tenant_1_url_1',
};

const NAMESPACE_NOT_FOUND = 26;
const INDEX_NOT_FOUND = 27;

@Injectable()
export class LegacyIndexCleanupService implements OnModuleInit {
  private readonly logger = new Logger(LegacyIndexCleanupService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit(): Promise<void> {
    for (const [collection, index] of Object.entries(LEGACY_UNIQUE_INDEXES)) {
      try {
        await this.connection.collection(collection).dropIndex(index);
        this.logger.log(`Dropped legacy index ${collection}.${index}`);
      } catch (error) {
        const code = (error as { code?: number }).code;
        if (code === NAMESPACE_NOT_FOUND || code === INDEX_NOT_FOUND) continue;
        this.logger.error(`Could not drop ${collection}.${index}`, error as Error);
      }
    }
  }
}

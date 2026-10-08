import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import type { Connection } from 'mongoose';
import { JOB_RETENTION_DAYS } from '../modules/crawl-jobs/constants/crawl-jobs.constants.js';
import { CrawlJob } from '../modules/crawl-jobs/schemas/crawl-job.schema.js';
import { PasswordResetToken } from '../modules/auth/schemas/password-reset-token.schema.js';
import { Permission } from '../modules/permissions/schemas/permission.schema.js';
import { Role } from '../modules/roles/schemas/role.schema.js';
import {
  SITE_TOKEN_PREFIX,
  WIDGET_DEFAULTS,
} from '../modules/sites/constants/sites.constants.js';
import { Site } from '../modules/sites/schemas/site.schema.js';
import {
  DEFAULT_RETENTION_DAYS,
  PLAN_LIMITS,
  TENANT_PLANS,
} from '../modules/tenants/constants/tenants.constants.js';
import { Tenant } from '../modules/tenants/schemas/tenant.schema.js';
import { User } from '../modules/users/schemas/user.schema.js';

/** Permission keys that only your own team should hold (the rest default to `company`). */
const PLATFORM_PERMISSION_KEYS = [
  'tenants.list',
  'tenants.create',
  'tenants.suspend',
  'tenants.delete',
];

const DAY_MS = 24 * 60 * 60 * 1000;
/** Old finished jobs are kept at least this long after the upgrade, so none vanish on the first TTL pass. */
const MIGRATION_GRACE_DAYS = 30;

/** `Support Lead` -> `support_lead` */
export const roleKeyFrom = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'role';

/** `https://acme.com/docs` -> `https://acme.com`; null if it is not a URL. */
export const originOf = (url: string): string | null => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

interface Row {
  _id: unknown;
  name?: string;
  email?: string;
  url?: string;
  key?: string;
  tenant?: unknown;
  isAdmin?: boolean;
  isDefault?: boolean;
}

/**
 * One-off upgrade of data written before the admin-db-design fields existed.
 * Idempotent: every step only touches documents that lack the new field, so
 * running it again (every boot) changes nothing once the data is current.
 *
 * It works on the raw collections, so soft-deleted documents are upgraded too
 * and the soft-delete plugin cannot hide them.
 */
@Injectable()
export class ExistingDataBackfillService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ExistingDataBackfillService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.permissions();
      await this.roles();
      await this.tenants();
      await this.users();
      await this.sites();
      await this.crawlJobs();
      await this.resetTokens();
    } catch (error) {
      // Never block start-up: the app still runs on the old shape, and the next boot retries.
      this.logger.error('Backfill failed', error as Error);
    }
  }

  private collection(model: string) {
    return this.connection.models[model].collection;
  }

  private report(what: string, count: number): void {
    if (count > 0) this.logger.log(`Backfilled ${what} on ${count} document(s)`);
  }

  private async permissions(): Promise<void> {
    const permissions = this.collection(Permission.name);
    const scope = await permissions.updateMany({ scope: { $exists: false } }, [
      {
        $set: {
          scope: {
            $cond: [{ $in: ['$key', PLATFORM_PERMISSION_KEYS] }, 'platform', 'company'],
          },
        },
      },
    ]);
    this.report('permissions.scope', scope.modifiedCount);

    // The module a key belongs to: `sites.create` and `sites` both group under `sites`.
    const group = await permissions.updateMany({ group: { $exists: false } }, [
      { $set: { group: { $arrayElemAt: [{ $split: ['$key', '.'] }, 0] } } },
    ]);
    this.report('permissions.group', group.modifiedCount);
  }

  private async roles(): Promise<void> {
    const roles = this.collection(Role.name);
    const rows = (await roles.find({}).toArray()) as unknown as Row[];
    const taken = new Set(
      rows.filter((r) => typeof r.key === 'string').map((r) => r.key as string),
    );

    // Built-in roles first, so a custom role can never claim `super_admin` or `owner`.
    const pending = rows
      .filter((r) => typeof r.key !== 'string')
      .sort((a, b) => Number(Boolean(b.isAdmin || b.isDefault)) - Number(Boolean(a.isAdmin || a.isDefault)));

    let count = 0;
    for (const role of pending) {
      const preferred = role.isAdmin
        ? 'super_admin'
        : role.isDefault
          ? 'owner'
          : roleKeyFrom(role.name ?? '');
      let key = preferred;
      for (let n = 2; taken.has(key); n++) key = `${preferred}_${n}`;
      taken.add(key);

      await roles.updateOne(
        { _id: role._id as never },
        {
          $set: {
            key,
            scope: role.isAdmin ? 'platform' : 'company',
            tenant: role.tenant ?? null,
          },
        },
      );
      count++;
    }
    this.report('roles.key/scope/tenant', count);

    const scope = await roles.updateMany({ scope: { $exists: false } }, [
      { $set: { scope: { $cond: ['$isAdmin', 'platform', 'company'] } } },
    ]);
    this.report('roles.scope', scope.modifiedCount);
    const tenant = await roles.updateMany({ tenant: { $exists: false } }, {
      $set: { tenant: null },
    });
    this.report('roles.tenant', tenant.modifiedCount);
  }

  private async tenants(): Promise<void> {
    const tenants = this.collection(Tenant.name);
    const users = this.collection(User.name);

    for (const plan of TENANT_PLANS) {
      // A tenant with no plan counts as `free`, the schema default.
      const filter =
        plan === 'free'
          ? { limits: { $exists: false }, plan: { $in: ['free', null] } }
          : { limits: { $exists: false }, plan };
      const done = await tenants.updateMany(filter, {
        $set: { limits: { ...PLAN_LIMITS[plan] } },
      });
      this.report(`tenants.limits (${plan})`, done.modifiedCount);
    }

    // The contact is whoever joined the workspace first.
    const withoutContact = (await tenants
      .find({ contact: { $exists: false } })
      .toArray()) as unknown as Row[];
    for (const tenant of withoutContact) {
      const first = (await users.findOne(
        { tenant: tenant._id as never },
        { sort: { createdAt: 1 } },
      )) as unknown as Row | null;
      await tenants.updateOne(
        { _id: tenant._id as never },
        {
          $set: {
            contact: {
              name: first?.name ?? '',
              email: first?.email ?? '',
              phone: '',
            },
          },
        },
      );
    }
    this.report('tenants.contact', withoutContact.length);

    const settings = await tenants.updateMany({ settings: { $exists: false } }, {
      $set: {
        settings: {
          retentionDays: DEFAULT_RETENTION_DAYS,
          defaultLlmModel: null,
          dataRegion: null,
        },
      },
    });
    this.report('tenants.settings', settings.modifiedCount);
    await tenants.updateMany({ supportAccessUntil: { $exists: false } }, {
      $set: { supportAccessUntil: null },
    });
    await tenants.updateMany({ createdBy: { $exists: false } }, {
      $set: { createdBy: null },
    });
  }

  private async users(): Promise<void> {
    const users = this.collection(User.name);

    // They signed up with a password and were never asked to verify, so account creation is the best proof there is.
    const verified = await users.updateMany({ emailVerifiedAt: { $exists: false } }, [
      { $set: { emailVerifiedAt: { $ifNull: ['$createdAt', '$$NOW'] } } },
    ]);
    this.report('users.emailVerifiedAt', verified.modifiedCount);

    const mfa = await users.updateMany({ mfa: { $exists: false } }, {
      $set: { mfa: { enabled: false, totpSecretEnc: null, recoveryCodeHashes: [] } },
    });
    this.report('users.mfa', mfa.modifiedCount);
    await users.updateMany({ failedLogins: { $exists: false } }, {
      $set: { failedLogins: 0 },
    });
    await users.updateMany({ lockedUntil: { $exists: false } }, {
      $set: { lockedUntil: null },
    });
    await users.updateMany({ passwordChangedAt: { $exists: false } }, {
      $set: { passwordChangedAt: null },
    });
  }

  private async sites(): Promise<void> {
    const sites = this.collection(Site.name);

    const withoutToken = (await sites
      .find({ publicToken: { $exists: false } })
      .toArray()) as unknown as Row[];
    for (const site of withoutToken) {
      const origin = originOf(site.url ?? '');
      await sites.updateOne(
        { _id: site._id as never },
        {
          $set: {
            publicToken: `${SITE_TOKEN_PREFIX}${randomBytes(16).toString('hex')}`,
            allowedOrigins: origin ? [origin] : [],
          },
        },
      );
    }
    // No `secretKeyHash` for these: the secret is shown once at creation, so an old site's cannot be produced. Rotate it to get one.
    this.report('sites.publicToken/allowedOrigins', withoutToken.length);

    const settings = await sites.updateMany({ settings: { $exists: false } }, {
      $set: {
        settings: {
          ...structuredClone(WIDGET_DEFAULTS),
          bot: { ...structuredClone(WIDGET_DEFAULTS.bot), llmModel: null },
          rag: { ...structuredClone(WIDGET_DEFAULTS.rag), embeddingModel: null },
        },
      },
    });
    this.report('sites.settings', settings.modifiedCount);
    await sites.updateMany({ allowedOrigins: { $exists: false } }, {
      $set: { allowedOrigins: [] },
    });
    await sites.updateMany({ settingsVersion: { $exists: false } }, {
      $set: { settingsVersion: 1 },
    });
  }

  private async crawlJobs(): Promise<void> {
    const jobs = this.collection(CrawlJob.name);
    await jobs.updateMany({ heartbeatAt: { $exists: false } }, {
      $set: { heartbeatAt: null },
    });

    const now = Date.now();
    const graceUntil = new Date(now + MIGRATION_GRACE_DAYS * DAY_MS);
    // Finished jobs expire retention-days after they ended, but never sooner than the grace period.
    const finished = await jobs.updateMany(
      {
        expireAt: { $exists: false },
        status: { $in: ['completed', 'failed', 'cancelled'] },
      },
      [
        {
          $set: {
            expireAt: {
              $max: [
                {
                  $add: [
                    { $ifNull: ['$finishedAt', { $ifNull: ['$updatedAt', '$$NOW'] }] },
                    JOB_RETENTION_DAYS * DAY_MS,
                  ],
                },
                graceUntil,
              ],
            },
          },
        },
      ],
    );
    this.report('crawl_jobs.expireAt (finished)', finished.modifiedCount);
    // Queued and running jobs must not expire.
    await jobs.updateMany({ expireAt: { $exists: false } }, {
      $set: { expireAt: null },
    });
  }

  private async resetTokens(): Promise<void> {
    const tokens = this.collection(PasswordResetToken.name);
    await tokens.updateMany({ purpose: { $exists: false } }, {
      $set: { purpose: 'reset_password' },
    });
    await tokens.updateMany({ usedAt: { $exists: false } }, {
      $set: { usedAt: null },
    });
  }
}

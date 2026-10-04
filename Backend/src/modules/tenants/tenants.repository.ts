import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { CrawlJob } from '../crawl-jobs/schemas/crawl-job.schema.js';
import { Role } from '../roles/schemas/role.schema.js';
import { Site } from '../sites/schemas/site.schema.js';
import { User } from '../users/schemas/user.schema.js';
import { Tenant } from './schemas/tenant.schema.js';
import type { TenantUsage } from './types/tenant.type.js';

interface CountRow {
  _id: Types.ObjectId;
  count: number;
}

@Injectable()
export class TenantsRepository extends BaseRepository<Tenant> {
  constructor(
    @InjectModel(Tenant.name) tenantModel: Model<Tenant>,
    // The tenant owns these collections: read for usage, written only to cascade a delete.
    @InjectModel(Site.name) private readonly siteModel: Model<Site>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(CrawlJob.name) private readonly jobModel: Model<CrawlJob>,
    // Read-only: tells admins apart from workspace users when migrating.
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {
    super(tenantModel);
  }

  /** Non-admin users that predate workspaces and so belong to none. */
  async findUsersWithoutWorkspace() {
    const adminRoles = await this.roleModel.find({ isAdmin: true }).select('_id').exec();
    return this.userModel
      .find({ tenant: null, role: { $nin: adminRoles.map((role) => role._id) } })
      .select('name')
      .exec();
  }

  assignWorkspace(userId: Types.ObjectId, tenantId: Types.ObjectId) {
    return this.userModel.updateOne({ _id: userId }, { $set: { tenant: tenantId } });
  }

  findBySlug(slug: string) {
    return this.findOne({ slug });
  }

  /** Sites / users per tenant: two grouped queries regardless of page size. */
  async usageFor(ids: Types.ObjectId[]): Promise<Map<string, TenantUsage>> {
    const usage = new Map<string, TenantUsage>(
      ids.map((id) => [String(id), { sites: 0, users: 0 }]),
    );
    const pipeline = [
      { $match: { tenant: { $in: ids } } },
      { $group: { _id: '$tenant', count: { $sum: 1 } } },
    ];

    const [sites, users] = await Promise.all([
      this.siteModel.aggregate<CountRow>(pipeline),
      this.userModel.aggregate<CountRow>(pipeline),
    ]);
    const fill = (rows: CountRow[], field: keyof TenantUsage) => {
      for (const row of rows) {
        const entry = usage.get(String(row._id));
        if (entry) entry[field] = row.count;
      }
    };
    fill(sites, 'sites');
    fill(users, 'users');
    return usage;
  }

  /** Removes everything a tenant owns. The tenant document itself is deleted by the caller. */
  async deleteOwnedData(id: Types.ObjectId | string): Promise<void> {
    await Promise.all([
      this.jobModel.deleteMany({ tenant: id }),
      this.siteModel.deleteMany({ tenant: id }),
      this.userModel.deleteMany({ tenant: id }),
    ]);
  }
}

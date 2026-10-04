import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { isAdmin, scopeTenant } from '../../common/utils/tenant-scope.util.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { CrawlJob } from '../crawl-jobs/schemas/crawl-job.schema.js';
import { Role } from '../roles/schemas/role.schema.js';
import { Site } from '../sites/schemas/site.schema.js';
import { Tenant } from '../tenants/schemas/tenant.schema.js';
import { User } from '../users/schemas/user.schema.js';

interface Bucket {
  _id: string;
  count: number;
}

const toRecord = (rows: Bucket[]) =>
  Object.fromEntries(rows.map((row) => [row._id, row.count]));

/** Read-only aggregates for the landing page; platform-wide for Admins, one workspace for everyone else. */
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Site.name) private readonly sites: Model<Site>,
    @InjectModel(CrawlJob.name) private readonly jobs: Model<CrawlJob>,
    @InjectModel(Tenant.name) private readonly tenants: Model<Tenant>,
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Role.name) private readonly roles: Model<Role>,
  ) {}

  async stats(user: AuthUser, tenantId?: string) {
    const tenant = scopeTenant(user, tenantId);
    const match = tenant ? { tenant: new Types.ObjectId(tenant) } : {};
    const platform = isAdmin(user) && !tenant;
    // The super admin is never counted among the users.
    const hiddenRoles = platform
      ? await this.roles.find({ isHidden: true }).select('_id').exec()
      : [];

    const [
      siteStatuses,
      jobStatuses,
      indexed,
      recentJobs,
      tenantCount,
      userCount,
      recentTenants,
    ] = await Promise.all([
      this.sites.aggregate<Bucket>([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.jobs.aggregate<Bucket>([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.sites.aggregate<{ _id: null; pages: number; chunks: number }>([
        { $match: match },
        {
          $group: {
            _id: null,
            pages: { $sum: '$stats.pages' },
            chunks: { $sum: '$stats.chunks' },
          },
        },
      ]),
      this.jobs
        .find(match)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate([
          { path: 'site', select: 'name url' },
          { path: 'tenant', select: 'name' },
        ])
        .exec(),
      platform ? this.tenants.countDocuments() : Promise.resolve(null),
      platform
        ? this.users.countDocuments({ role: { $nin: hiddenRoles.map((role) => role._id) } })
        : Promise.resolve(null),
      platform
        ? this.tenants.find().sort({ createdAt: -1 }).limit(5).exec()
        : Promise.resolve([]),
    ]);

    const sitesByStatus = toRecord(siteStatuses);

    return {
      scope: platform ? 'platform' : 'workspace',
      totals: {
        sites: Object.values(sitesByStatus).reduce((sum, n) => sum + n, 0),
        pages: indexed[0]?.pages ?? 0,
        chunks: indexed[0]?.chunks ?? 0,
        tenants: tenantCount,
        users: userCount,
      },
      sitesByStatus,
      jobsByStatus: toRecord(jobStatuses),
      recentJobs,
      recentTenants,
    };
  }
}

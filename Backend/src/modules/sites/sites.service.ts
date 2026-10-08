import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex, sortDirection } from '../../common/utils/query.util.js';
import {
  assertTenantAccess,
  refId,
  scopeTenant,
  tenantForCreate,
} from '../../common/utils/tenant-scope.util.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { ACTIVE_JOB_STATUSES } from '../crawl-jobs/constants/crawl-jobs.constants.js';
import { CrawlJobsRepository } from '../crawl-jobs/crawl-jobs.repository.js';
import { PLAN_LIMITS } from '../tenants/constants/tenants.constants.js';
import { TenantsService } from '../tenants/tenants.service.js';
import {
  SITE_DEFAULTS,
  SITE_ERRORS,
  SITE_SECRET_PREFIX,
  SITE_TOKEN_PREFIX,
} from './constants/sites.constants.js';
import type { CrawlSettingsDto, CreateSiteDto } from './dto/create-site.dto.js';
import type { ListSitesQueryDto } from './dto/list-sites-query.dto.js';
import type { UpdateSiteDto } from './dto/update-site.dto.js';
import type { Site, SiteDocument } from './schemas/site.schema.js';
import { SitesRepository } from './sites.repository.js';

const POPULATE = { path: 'tenant', select: 'name slug' };

/** `HTTPS://Example.com/docs/#intro` -> `https://example.com/docs` */
export function normalizeUrl(raw: string): { url: string; domain: string } {
  const parsed = new URL(raw);
  const path = parsed.pathname.replace(/\/+$/, '');
  return {
    url: `${parsed.protocol}//${parsed.host.toLowerCase()}${path}`,
    domain: parsed.hostname.toLowerCase(),
  };
}

const cleanPaths = (paths?: string[]) =>
  paths?.map((p) => p.trim()).filter(Boolean);

@Injectable()
export class SitesService {
  constructor(
    private readonly repository: SitesRepository,
    private readonly jobs: CrawlJobsRepository,
    private readonly tenants: TenantsService,
  ) {}

  async create(user: AuthUser, dto: CreateSiteDto) {
    const tenantId = tenantForCreate(user, dto.tenantId);
    const tenant = await this.tenants.getOrFail(tenantId);
    const limits = tenant.limits ?? PLAN_LIMITS[tenant.plan];

    if ((await this.repository.countForTenant(tenantId)) >= limits.maxSites) {
      throw new AppException(SITE_ERRORS.LIMIT_REACHED);
    }
    if (dto.crawl?.maxPages && dto.crawl.maxPages > limits.maxPagesPerSite) {
      throw new AppException(SITE_ERRORS.PAGE_LIMIT_EXCEEDED);
    }

    const { url, domain } = normalizeUrl(dto.url);
    if (await this.repository.findByUrl(tenantId, url)) {
      throw new AppException(SITE_ERRORS.URL_TAKEN);
    }

    // The secret is only ever shown here; just its hash is kept.
    const secretKey = `${SITE_SECRET_PREFIX}${randomBytes(24).toString('hex')}`;

    const site = await this.repository.create({
      tenant: tenantId as unknown as Site['tenant'],
      name: dto.name,
      url,
      domain,
      publicToken: `${SITE_TOKEN_PREFIX}${randomBytes(16).toString('hex')}`,
      secretKeyHash: createHash('sha256').update(secretKey).digest('hex'),
      allowedOrigins: [new URL(url).origin],
      crawl: this.toCrawlSettings(
        dto.crawl,
        Math.min(SITE_DEFAULTS.maxPages, limits.maxPagesPerSite),
      ),
    });
    await this.jobs.queue(tenantId, site._id, 'initial', user.id);
    return Object.assign(await this.findOne(user, String(site._id)), {
      secretKey,
    });
  }

  async findAll(user: AuthUser, query: ListSitesQueryDto) {
    const filter: QueryFilter<Site> = {};
    const tenant = scopeTenant(user, query.tenantId);
    if (tenant) filter.tenant = tenant;
    if (query.status) filter.status = query.status;
    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: pattern }, { url: pattern }];
    }

    const page = await this.repository.findPage(filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: sortDirection(query.sortOrder) },
      populate: POPULATE,
    });
    const active = await this.activeJobs(page.items.map((site) => site._id));
    return {
      meta: page.meta,
      items: page.items.map((site) =>
        Object.assign(site.toJSON(), {
          activeJob: active.get(String(site._id)) ?? null,
        }),
      ),
    };
  }

  /** Lightweight list for dropdowns (filters). */
  async findOptions(user: AuthUser, tenantId?: string) {
    const tenant = scopeTenant(user, tenantId);
    const sites = await this.repository
      .find(tenant ? { tenant } : {})
      .sort({ name: 1 })
      .select('name url tenant')
      .exec();
    return sites.map((site) => ({
      id: String(site._id),
      name: site.name,
      url: site.url,
      tenantId: String(site.tenant),
    }));
  }

  async findOne(user: AuthUser, id: string) {
    const site = await this.getAccessible(user, id);
    const active = await this.activeJobs([site._id]);
    return Object.assign(site.toJSON(), {
      activeJob: active.get(String(site._id)) ?? null,
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateSiteDto) {
    const existing = await this.getAccessible(user, id);

    const changes: Record<string, unknown> = {};
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.crawl) {
      const tenant = await this.tenants.getOrFail(refId(existing.tenant));
      const maxPages = (tenant.limits ?? PLAN_LIMITS[tenant.plan])
        .maxPagesPerSite;
      if (dto.crawl.maxPages && dto.crawl.maxPages > maxPages) {
        throw new AppException(SITE_ERRORS.PAGE_LIMIT_EXCEEDED);
      }
      const current = existing.crawl;
      changes.crawl = this.toCrawlSettings(
        dto.crawl,
        current.maxPages,
        current,
      );
    }

    const updated = await this.repository.updateById(
      id,
      { $set: changes },
      POPULATE,
    );
    if (!updated) throw new AppException(SITE_ERRORS.NOT_FOUND);
    return updated;
  }

  async recrawl(user: AuthUser, id: string) {
    const site = await this.getAccessible(user, id);
    if (await this.jobs.hasActiveJob(site._id)) {
      throw new AppException(SITE_ERRORS.CRAWL_ACTIVE);
    }
    await this.jobs.queue(refId(site.tenant), site._id, 'manual', user.id);
    await this.repository.updateById(id, { $set: { status: 'pending' } });
    return this.findOne(user, id);
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const site = await this.getAccessible(user, id);
    await this.repository.softDeleteJobs(site._id);
    await this.repository.softDeleteById(id);
  }

  /** Loads a site the caller may see; another tenant's site is a plain 404. */
  async getAccessible(user: AuthUser, id: string): Promise<SiteDocument> {
    const site = await this.repository.findById(id, POPULATE);
    if (!site) throw new AppException(SITE_ERRORS.NOT_FOUND);
    assertTenantAccess(user, site.tenant);
    return site;
  }

  private toCrawlSettings(
    input: CrawlSettingsDto | undefined,
    defaultMaxPages: number,
    base?: Site['crawl'],
  ): Site['crawl'] {
    return {
      maxPages: input?.maxPages ?? base?.maxPages ?? defaultMaxPages,
      maxDepth: input?.maxDepth ?? base?.maxDepth ?? SITE_DEFAULTS.maxDepth,
      includePaths: cleanPaths(input?.includePaths) ?? base?.includePaths ?? [],
      excludePaths: cleanPaths(input?.excludePaths) ?? base?.excludePaths ?? [],
      respectRobots: input?.respectRobots ?? base?.respectRobots ?? true,
      recrawl: input?.recrawl ?? base?.recrawl ?? 'off',
    };
  }

  private async activeJobs(siteIds: SiteDocument['_id'][]) {
    const jobs = await this.jobs
      .find({ site: { $in: siteIds }, status: { $in: ACTIVE_JOB_STATUSES } })
      .sort({ createdAt: -1 })
      .exec();
    const byId = new Map<
      string,
      { id: string; status: string; stage: string | null; progress: number }
    >();
    for (const job of jobs) {
      const key = String(job.site);
      if (byId.has(key)) continue;
      byId.set(key, {
        id: String(job._id),
        status: job.status,
        stage: job.stage,
        progress: job.progress,
      });
    }
    return byId;
  }
}

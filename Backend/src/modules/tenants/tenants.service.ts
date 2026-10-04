import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { randomBytes } from 'node:crypto';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex, sortDirection } from '../../common/utils/query.util.js';
import {
  assertTenantAccess,
  isAdmin,
} from '../../common/utils/tenant-scope.util.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { PLAN_LIMITS, TENANT_ERRORS } from './constants/tenants.constants.js';
import type { CreateTenantDto } from './dto/create-tenant.dto.js';
import type { ListTenantsQueryDto } from './dto/list-tenants-query.dto.js';
import type { UpdateTenantStatusDto } from './dto/update-tenant-status.dto.js';
import type { UpdateTenantDto } from './dto/update-tenant.dto.js';
import type { Tenant, TenantDocument } from './schemas/tenant.schema.js';
import { TenantsRepository } from './tenants.repository.js';
import type { TenantUsage } from './types/tenant.type.js';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'workspace';

@Injectable()
export class TenantsService {
  constructor(private readonly repository: TenantsRepository) {}

  /** Also used by sign-up to give every new customer their own workspace. */
  async create(dto: CreateTenantDto): Promise<TenantDocument> {
    return this.repository.create({
      name: dto.name,
      slug: await this.uniqueSlug(dto.name),
      plan: dto.plan ?? 'free',
    });
  }

  async findAll(query: ListTenantsQueryDto) {
    const filter: QueryFilter<Tenant> = {};
    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: pattern }, { slug: pattern }];
    }
    if (query.status) filter.status = query.status;
    if (query.plan) filter.plan = query.plan;

    const page = await this.repository.findPage(filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: sortDirection(query.sortOrder) },
    });
    const usage = await this.repository.usageFor(
      page.items.map((tenant) => tenant._id),
    );
    return {
      meta: page.meta,
      items: page.items.map((tenant) =>
        this.toView(tenant, usage.get(String(tenant._id))),
      ),
    };
  }

  /** Lightweight list for admin dropdowns ("which workspace?"). */
  async findOptions() {
    const tenants = await this.repository
      .find()
      .sort({ name: 1 })
      .select('name slug')
      .exec();
    return tenants.map((tenant) => ({
      id: String(tenant._id),
      name: tenant.name,
      slug: tenant.slug,
    }));
  }

  async findOne(user: AuthUser, id: string) {
    assertTenantAccess(user, id);
    const tenant = await this.getOrFail(id);
    const usage = await this.repository.usageFor([tenant._id]);
    return this.toView(tenant, usage.get(String(tenant._id)));
  }

  async update(user: AuthUser, id: string, dto: UpdateTenantDto) {
    assertTenantAccess(user, id);
    const existing = await this.getOrFail(id);
    if (dto.plan && dto.plan !== existing.plan && !isAdmin(user)) {
      throw new AppException(TENANT_ERRORS.PLAN_FORBIDDEN);
    }

    const updated = await this.repository.updateById(id, { $set: dto });
    if (!updated) throw new AppException(TENANT_ERRORS.NOT_FOUND);
    return this.toView(updated);
  }

  async updateStatus(id: string, dto: UpdateTenantStatusDto) {
    await this.getOrFail(id);
    const updated = await this.repository.updateById(id, {
      $set: { status: dto.status },
    });
    if (!updated) throw new AppException(TENANT_ERRORS.NOT_FOUND);
    return this.toView(updated);
  }

  async remove(id: string): Promise<void> {
    await this.getOrFail(id);
    await this.repository.deleteOwnedData(id);
    await this.repository.deleteById(id);
  }

  async getOrFail(id: string): Promise<TenantDocument> {
    const tenant = await this.repository.findById(id);
    if (!tenant) throw new AppException(TENANT_ERRORS.NOT_FOUND);
    return tenant;
  }

  private toView(tenant: TenantDocument, usage?: TenantUsage) {
    return Object.assign(tenant.toJSON(), {
      limits: PLAN_LIMITS[tenant.plan],
      usage,
    });
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    if (!(await this.repository.findBySlug(base))) return base;
    return `${base}-${randomBytes(3).toString('hex')}`;
  }
}

import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { AppException } from '../../common/exceptions/app.exception.js';
import { hashPassword } from '../../common/utils/password.util.js';
import { escapeRegex, sortDirection } from '../../common/utils/query.util.js';
import {
  assertTenantAccess,
  isAdmin,
  scopeTenant,
  tenantForCreate,
} from '../../common/utils/tenant-scope.util.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { PermissionsRepository } from '../permissions/permissions.repository.js';
import { ROLE_ERRORS } from '../roles/constants/roles.constants.js';
import { RolesRepository } from '../roles/roles.repository.js';
import { TENANT_ERRORS } from '../tenants/constants/tenants.constants.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { USER_ERRORS } from './constants/users.constants.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import type { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto.js';
import type { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import type { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { User, UserDocument } from './schemas/user.schema.js';
import { USER_POPULATE } from './types/user.type.js';
import { UsersRepository } from './users.repository.js';

/** Detail views also carry the permissions granted to the person directly. */
const DETAIL_POPULATE = [
  ...USER_POPULATE,
  { path: 'permissions', select: 'name key parent isActive' },
];

/**
 * Every method takes the acting user: a super admin manages accounts
 * platform-wide, anyone else who was granted `users.*` only reaches their own
 * workspace. People holding a hidden role (the super admin) are never listed or
 * reachable here, and the Admin role can never be assigned to anyone.
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly tenants: TenantsService,
  ) {}

  async create(actor: AuthUser, dto: CreateUserDto) {
    await this.assertEmailAvailable(dto.email);
    await this.assertRoleAssignable(dto.roleId);
    const tenant = await this.resolveTenant(actor, dto.tenantId);

    const user = await this.repository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      role: dto.roleId as unknown as User['role'],
      tenant: tenant as unknown as User['tenant'],
      isActive: dto.isActive ?? true,
    });
    return this.findById(actor, String(user._id));
  }

  async findAll(actor: AuthUser, query: ListUsersQueryDto) {
    const filter: QueryFilter<User> = {};

    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: pattern }, { email: pattern }];
    }
    const hidden = await this.hiddenRoleIds();
    filter.role = query.roleId
      ? { $eq: query.roleId, $nin: hidden }
      : { $nin: hidden };
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    const tenant = scopeTenant(actor, query.tenantId);
    if (tenant) filter.tenant = tenant;

    const page = await this.repository.findPage(filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: sortDirection(query.sortOrder) },
      populate: USER_POPULATE,
    });
    return { meta: page.meta, items: page.items.map((user) => user.toJSON()) };
  }

  async findById(actor: AuthUser, id: string) {
    return (await this.load(actor, id)).toJSON();
  }

  async update(actor: AuthUser, id: string, dto: UpdateUserDto) {
    const existing = await this.load(actor, id);
    if (dto.email && dto.email !== existing.email) {
      await this.assertEmailAvailable(dto.email);
    }
    return this.persist(id, dto);
  }

  async updateStatus(actor: AuthUser, id: string, dto: UpdateUserStatusDto) {
    await this.load(actor, id);
    return this.persist(id, { isActive: dto.isActive });
  }

  async updateRole(actor: AuthUser, id: string, dto: UpdateUserRoleDto) {
    const existing = await this.load(actor, id);
    await this.assertRoleAssignable(dto.roleId);

    let tenant: string;
    if (dto.tenantId) {
      tenant = await this.resolveTenant(actor, dto.tenantId);
    } else if (existing.tenant) {
      tenant = String(existing.tenant._id ?? existing.tenant);
    } else {
      throw new AppException(TENANT_ERRORS.TENANT_REQUIRED);
    }
    return this.persist(id, { role: dto.roleId, tenant });
  }

  /**
   * Gives one person permissions beyond their role's. Only a super admin may do
   * this, so no one can hand out more access than they hold.
   */
  async updatePermissions(
    actor: AuthUser,
    id: string,
    dto: UpdateUserPermissionsDto,
  ) {
    if (!isAdmin(actor)) {
      throw new AppException(USER_ERRORS.PERMISSIONS_ADMIN_ONLY);
    }
    await this.load(actor, id);

    const ids = [...new Set(dto.permissionIds)];
    if (ids.length > 0) {
      const found = await this.permissionsRepository
        .findByIds(ids)
        .select('_id')
        .exec();
      if (found.length !== ids.length) {
        throw new AppException(USER_ERRORS.INVALID_PERMISSIONS);
      }
    }
    return this.persist(id, { permissions: ids }, DETAIL_POPULATE);
  }

  async remove(actor: AuthUser, id: string): Promise<void> {
    await this.load(actor, id);
    await this.repository.deleteById(id);
  }

  /** Loads a user the actor may see. Hidden-role holders do not exist as far as callers can tell. */
  private async load(actor: AuthUser, id: string): Promise<UserDocument> {
    const user = await this.repository.findById(id, DETAIL_POPULATE);
    const role = user?.role as unknown as { isHidden?: boolean } | null;
    if (!user || role?.isHidden) throw new AppException(USER_ERRORS.NOT_FOUND);
    if (!isAdmin(actor)) assertTenantAccess(actor, user.tenant ?? 'none');
    return user;
  }

  private async persist(
    id: string,
    changes: object,
    populate: typeof DETAIL_POPULATE = USER_POPULATE,
  ) {
    const updated = await this.repository.updateById(
      id,
      { $set: changes },
      populate,
    );
    if (!updated) throw new AppException(USER_ERRORS.NOT_FOUND);
    return updated.toJSON();
  }

  private async hiddenRoleIds() {
    const roles = await this.rolesRepository
      .find({ isHidden: true })
      .select('_id')
      .exec();
    return roles.map((role) => role._id);
  }

  private async resolveTenant(
    actor: AuthUser,
    requested?: string,
  ): Promise<string> {
    const tenantId = tenantForCreate(actor, requested);
    await this.tenants.getOrFail(tenantId);
    return tenantId;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    if (await this.repository.exists({ email })) {
      throw new AppException(USER_ERRORS.EMAIL_TAKEN);
    }
  }

  /** Any visible, active, non-admin role. The Admin role is never handed out. */
  private async assertRoleAssignable(roleId: string) {
    const role = await this.rolesRepository.findById(roleId);
    if (!role || role.isHidden) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    if (!role.isActive) throw new AppException(ROLE_ERRORS.INACTIVE);
    if (role.isAdmin) {
      throw new AppException(ROLE_ERRORS.ADMIN_ASSIGN_FORBIDDEN);
    }
    return role;
  }
}

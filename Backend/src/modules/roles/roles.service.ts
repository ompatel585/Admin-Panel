import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex, sortDirection } from '../../common/utils/query.util.js';
import { isAdmin } from '../../common/utils/tenant-scope.util.js';
import type { AuthUser } from '../auth/types/auth.type.js';
import { PermissionsRepository } from '../permissions/permissions.repository.js';
import { ROLE_ERRORS } from './constants/roles.constants.js';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { ListRolesQueryDto } from './dto/list-roles-query.dto.js';
import type { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto.js';
import type { UpdateRoleDto } from './dto/update-role.dto.js';
import { RolesRepository } from './roles.repository.js';
import type { Role, RoleDocument } from './schemas/role.schema.js';
import type { RoleOption } from './types/role.type.js';

const PERMISSIONS_POPULATE = {
  path: 'permissions',
  select: 'name key parent isActive',
};

/** Hidden roles (the super admin) are excluded from every read here, for every caller. */
const VISIBLE: QueryFilter<Role> = { isHidden: { $ne: true } };

@Injectable()
export class RolesService {
  constructor(
    private readonly repository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async create(actor: AuthUser, dto: CreateRoleDto): Promise<RoleDocument> {
    this.assertSuperAdmin(actor);
    await this.assertNameAvailable(dto.name);

    const role = await this.repository.create({
      name: dto.name,
      description: dto.description ?? '',
      isActive: dto.isActive ?? true,
    });
    return this.findById(String(role._id));
  }

  findAll(query: ListRolesQueryDto) {
    const filter: QueryFilter<Role> = { ...VISIBLE };
    if (query.search) {
      filter.name = new RegExp(escapeRegex(query.search), 'i');
    }
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return this.repository.findPage(filter, {
      page: query.page,
      limit: query.limit,
      sort: { name: sortDirection(query.sortOrder) },
      populate: PERMISSIONS_POPULATE,
    });
  }

  /** Lightweight list for dropdowns (e.g. the user form). */
  async findOptions(): Promise<RoleOption[]> {
    const roles = await this.repository
      .find({ ...VISIBLE, isActive: true })
      .sort({ name: 1 })
      .select('name isAdmin')
      .exec();
    return roles.map((role) => ({
      id: String(role._id),
      name: role.name,
      isAdmin: role.isAdmin,
    }));
  }

  async findById(id: string): Promise<RoleDocument> {
    const role = await this.repository.findVisibleById(id, PERMISSIONS_POPULATE);
    if (!role) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    return role;
  }

  async update(
    actor: AuthUser,
    id: string,
    dto: UpdateRoleDto,
  ): Promise<RoleDocument> {
    this.assertSuperAdmin(actor);
    const existing = await this.findById(id);

    const renamed = dto.name !== undefined && dto.name !== existing.name;
    if (existing.isSystem && (renamed || dto.isActive === false)) {
      throw new AppException(ROLE_ERRORS.SYSTEM_PROTECTED);
    }
    if (renamed && dto.name!.toLowerCase() !== existing.name.toLowerCase()) {
      await this.assertNameAvailable(dto.name!);
    }

    const updated = await this.repository.updateById(
      id,
      { $set: dto },
      PERMISSIONS_POPULATE,
    );
    if (!updated) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    return updated;
  }

  async updatePermissions(
    id: string,
    dto: UpdateRolePermissionsDto,
  ): Promise<RoleDocument> {
    const role = await this.findById(id);
    // Admin's access is implicit; its permission set is not editable.
    if (role.isAdmin) throw new AppException(ROLE_ERRORS.SYSTEM_PROTECTED);

    const permissions = await this.resolvePermissionIds(dto.permissionIds);
    const updated = await this.repository.updateById(
      id,
      { $set: { permissions } },
      PERMISSIONS_POPULATE,
    );
    if (!updated) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    return updated;
  }

  async remove(actor: AuthUser, id: string): Promise<void> {
    this.assertSuperAdmin(actor);
    const role = await this.findById(id);
    if (role.isSystem) throw new AppException(ROLE_ERRORS.SYSTEM_PROTECTED);
    if (await this.repository.hasUsers(id)) {
      throw new AppException(ROLE_ERRORS.IN_USE);
    }
    await this.repository.softDeleteById(id);
  }

  /** Creating, renaming and deleting roles is reserved for the super admin, whatever permissions another role is given. */
  private assertSuperAdmin(actor: AuthUser): void {
    if (!isAdmin(actor)) throw new AppException(ROLE_ERRORS.SUPER_ADMIN_ONLY);
  }

  private async assertNameAvailable(name: string): Promise<void> {
    if (await this.repository.findByName(name)) {
      throw new AppException(ROLE_ERRORS.NAME_TAKEN);
    }
  }

  private async resolvePermissionIds(ids: string[]) {
    if (ids.length === 0) return [];
    const found = await this.permissionsRepository
      .findByIds(ids)
      .select('_id')
      .exec();
    if (found.length !== new Set(ids).size) {
      throw new AppException(ROLE_ERRORS.INVALID_PERMISSIONS);
    }
    return found.map((permission) => permission._id);
  }
}

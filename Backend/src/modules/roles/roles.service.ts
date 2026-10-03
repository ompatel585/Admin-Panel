import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex, sortDirection } from '../../common/utils/query.util.js';
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

@Injectable()
export class RolesService {
  constructor(
    private readonly repository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async create(dto: CreateRoleDto): Promise<RoleDocument> {
    await this.assertNameAvailable(dto.name);
    const permissions = await this.resolvePermissionIds(
      dto.permissionIds ?? [],
    );

    const role = await this.repository.create({
      name: dto.name,
      description: dto.description ?? '',
      permissions,
      isActive: dto.isActive ?? true,
      isDefault: dto.isDefault ?? false,
    });
    if (role.isDefault) await this.repository.clearDefault(role._id);

    return this.findById(String(role._id));
  }

  findAll(query: ListRolesQueryDto) {
    const filter: QueryFilter<Role> = {};
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
      .find({ isActive: true })
      .sort({ name: 1 })
      .select('name')
      .exec();
    return roles.map((role) => ({ id: String(role._id), name: role.name }));
  }

  async findById(id: string): Promise<RoleDocument> {
    const role = await this.repository.findById(id, PERMISSIONS_POPULATE);
    if (!role) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleDocument> {
    const existing = await this.findById(id);

    if (existing.isSystem) {
      const renamed = dto.name !== undefined && dto.name !== existing.name;
      if (renamed || dto.isActive === false) {
        throw new AppException(ROLE_ERRORS.SYSTEM_PROTECTED);
      }
    }
    if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      await this.assertNameAvailable(dto.name);
    }
    if (dto.isDefault === false && existing.isDefault && existing.isSystem) {
      // There must always be a role to give new sign-ups.
      throw new AppException(ROLE_ERRORS.SYSTEM_PROTECTED);
    }

    const { permissionIds, ...fields } = dto;
    const changes: Record<string, unknown> = { ...fields };
    if (permissionIds !== undefined) {
      // Super Admin's access is implicit; its permission set is not editable.
      if (existing.isSuperAdmin) {
        throw new AppException(ROLE_ERRORS.SYSTEM_PROTECTED);
      }
      changes.permissions = await this.resolvePermissionIds(permissionIds);
    }

    const updated = await this.repository.updateById(
      id,
      { $set: changes },
      PERMISSIONS_POPULATE,
    );
    if (!updated) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    if (dto.isDefault) await this.repository.clearDefault(id);
    return updated;
  }

  async updatePermissions(
    id: string,
    dto: UpdateRolePermissionsDto,
  ): Promise<RoleDocument> {
    await this.findById(id);
    const permissions = await this.resolvePermissionIds(dto.permissionIds);

    const updated = await this.repository.updateById(
      id,
      { $set: { permissions } },
      PERMISSIONS_POPULATE,
    );
    if (!updated) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    if (await this.repository.hasUsers(id)) {
      throw new AppException(ROLE_ERRORS.IN_USE);
    }
    await this.repository.deleteById(id);
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

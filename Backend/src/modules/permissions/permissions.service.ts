import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { AppException } from '../../common/exceptions/app.exception.js';
import { escapeRegex, sortDirection } from '../../common/utils/query.util.js';
import { PERMISSION_ERRORS } from './constants/permissions.constants.js';
import type { CreatePermissionDto } from './dto/create-permission.dto.js';
import type { ListPermissionsQueryDto } from './dto/list-permissions-query.dto.js';
import type { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { PermissionsRepository } from './permissions.repository.js';
import type {
  Permission,
  PermissionDocument,
} from './schemas/permission.schema.js';
import type { PermissionTreeNode } from './types/permission.type.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly repository: PermissionsRepository) {}

  async create(dto: CreatePermissionDto): Promise<PermissionDocument> {
    if (await this.repository.findByKey(dto.key)) {
      throw new AppException(PERMISSION_ERRORS.KEY_TAKEN);
    }

    let parent: PermissionDocument['_id'] | null = null;

    if (dto.parentId) {
      const parentDoc = await this.repository.findById(dto.parentId);
      if (!parentDoc)
        throw new AppException(PERMISSION_ERRORS.PARENT_NOT_FOUND);
      if (parentDoc.parent) {
        throw new AppException(PERMISSION_ERRORS.NESTING_TOO_DEEP);
      }
      const prefix = `${parentDoc.key}.`;
      if (
        !dto.key.startsWith(prefix) ||
        dto.key.slice(prefix.length).includes('.')
      ) {
        throw new AppException(PERMISSION_ERRORS.KEY_PARENT_MISMATCH);
      }
      parent = parentDoc._id;
    } else if (dto.key.includes('.')) {
      throw new AppException(PERMISSION_ERRORS.KEY_PARENT_MISMATCH);
    }

    return this.repository.create({
      name: dto.name,
      key: dto.key,
      description: dto.description ?? '',
      parent,
      isActive: dto.isActive ?? true,
    });
  }

  findAll(query: ListPermissionsQueryDto) {
    const filter: QueryFilter<Permission> = {};

    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: pattern }, { key: pattern }];
    }
    if (query.parentId) filter.parent = query.parentId;
    if (query.type === 'module') filter.parent = null;
    if (query.type === 'sub') filter.parent = { $ne: null };
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return this.repository.findPage(filter, {
      page: query.page,
      limit: query.limit,
      sort: { key: sortDirection(query.sortOrder) },
      populate: { path: 'parent', select: 'name key' },
    });
  }

  async findTree(): Promise<PermissionTreeNode[]> {
    const docs = await this.repository.findAllSorted().exec();

    const nodes = new Map<string, PermissionTreeNode>(
      docs.map((doc) => [
        String(doc._id),
        {
          id: String(doc._id),
          name: doc.name,
          key: doc.key,
          description: doc.description,
          isActive: doc.isActive,
          isSystem: doc.isSystem,
          parent: doc.parent ? String(doc.parent) : null,
          children: [],
        },
      ]),
    );

    const roots: PermissionTreeNode[] = [];
    for (const node of nodes.values()) {
      const parent = node.parent ? nodes.get(node.parent) : undefined;
      (parent ? parent.children : roots).push(node);
    }
    return roots;
  }

  async findById(id: string): Promise<PermissionDocument> {
    const permission = await this.repository.findById(id, {
      path: 'parent',
      select: 'name key',
    });
    if (!permission) throw new AppException(PERMISSION_ERRORS.NOT_FOUND);
    return permission;
  }

  async findByKey(key: string): Promise<PermissionDocument> {
    const permission = await this.repository.findByKey(key);
    if (!permission) throw new AppException(PERMISSION_ERRORS.NOT_FOUND);
    return permission;
  }

  async update(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<PermissionDocument> {
    const existing = await this.findById(id);

    if (existing.isSystem && dto.isActive === false) {
      throw new AppException(PERMISSION_ERRORS.SYSTEM_PROTECTED);
    }

    const updated = await this.repository.updateById(
      id,
      { $set: dto },
      { path: 'parent', select: 'name key' },
    );
    if (!updated) throw new AppException(PERMISSION_ERRORS.NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findById(id);

    if (existing.isSystem) {
      throw new AppException(PERMISSION_ERRORS.SYSTEM_PROTECTED);
    }
    if ((await this.repository.countChildren(id)) > 0) {
      throw new AppException(PERMISSION_ERRORS.HAS_CHILDREN);
    }
    if (await this.repository.isAssignedToRole(id)) {
      throw new AppException(PERMISSION_ERRORS.IN_USE);
    }
    await this.repository.softDeleteById(id);
  }
}

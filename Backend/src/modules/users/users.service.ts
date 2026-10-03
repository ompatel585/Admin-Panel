import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { AppException } from '../../common/exceptions/app.exception.js';
import { hashPassword } from '../../common/utils/password.util.js';
import { escapeRegex, sortDirection } from '../../common/utils/query.util.js';
import { ROLE_ERRORS } from '../roles/constants/roles.constants.js';
import { RolesRepository } from '../roles/roles.repository.js';
import { USER_ERRORS } from './constants/users.constants.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import type { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import type { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { User, UserDocument } from './schemas/user.schema.js';
import { USER_POPULATE } from './types/user.type.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    await this.assertEmailAvailable(dto.email);
    await this.assertRoleAssignable(dto.roleId);

    const user = await this.repository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      role: dto.roleId as unknown as User['role'],
      isActive: dto.isActive ?? true,
    });
    return this.findById(String(user._id));
  }

  findAll(query: ListUsersQueryDto) {
    const filter: QueryFilter<User> = {};

    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: pattern }, { email: pattern }];
    }
    if (query.roleId) filter.role = query.roleId;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return this.repository.findPage(filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: sortDirection(query.sortOrder) },
      populate: USER_POPULATE,
    });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.repository.findById(id, USER_POPULATE);
    if (!user) throw new AppException(USER_ERRORS.NOT_FOUND);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const existing = await this.findById(id);
    if (dto.email && dto.email !== existing.email) {
      await this.assertEmailAvailable(dto.email);
    }
    return this.persist(id, dto);
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
  ): Promise<UserDocument> {
    await this.findById(id);
    return this.persist(id, { isActive: dto.isActive });
  }

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<UserDocument> {
    await this.findById(id);
    await this.assertRoleAssignable(dto.roleId);
    return this.persist(id, { role: dto.roleId });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.deleteById(id);
  }

  private async persist(id: string, changes: object): Promise<UserDocument> {
    const updated = await this.repository.updateById(
      id,
      { $set: changes },
      USER_POPULATE,
    );
    if (!updated) throw new AppException(USER_ERRORS.NOT_FOUND);
    return updated;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    if (await this.repository.exists({ email })) {
      throw new AppException(USER_ERRORS.EMAIL_TAKEN);
    }
  }

  private async assertRoleAssignable(roleId: string): Promise<void> {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) throw new AppException(ROLE_ERRORS.NOT_FOUND);
    if (!role.isActive) throw new AppException(ROLE_ERRORS.INACTIVE);
  }
}

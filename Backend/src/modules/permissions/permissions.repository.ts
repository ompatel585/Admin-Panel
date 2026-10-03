import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { Role } from '../roles/schemas/role.schema.js';
import { Permission } from './schemas/permission.schema.js';

@Injectable()
export class PermissionsRepository extends BaseRepository<Permission> {
  constructor(
    @InjectModel(Permission.name) permissionModel: Model<Permission>,
    // Read-only: needed to refuse deleting a permission a role still uses.
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {
    super(permissionModel);
  }

  findByKey(key: string) {
    return this.findOne({ key });
  }

  findAllSorted() {
    return this.find().sort({ key: 1 });
  }

  findByIds(ids: string[]) {
    return this.find({ _id: { $in: ids } });
  }

  countChildren(parentId: string | Types.ObjectId): Promise<number> {
    return this.count({ parent: parentId });
  }

  async isAssignedToRole(id: string | Types.ObjectId): Promise<boolean> {
    return (await this.roleModel.exists({ permissions: id })) !== null;
  }
}

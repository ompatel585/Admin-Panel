import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { escapeRegex } from '../../common/utils/query.util.js';
import { User } from '../users/schemas/user.schema.js';
import { Role } from './schemas/role.schema.js';

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(
    @InjectModel(Role.name) roleModel: Model<Role>,
    // Read-only: needed to refuse deleting a role that users still hold.
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super(roleModel);
  }

  /** Case-insensitive exact match. */
  findByName(name: string) {
    return this.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    });
  }

  findDefault() {
    return this.findOne({ isDefault: true });
  }

  findSuperAdmin() {
    return this.findOne({ isSuperAdmin: true });
  }

  clearDefault(exceptId?: string | Types.ObjectId) {
    return this.model.updateMany(
      exceptId
        ? { isDefault: true, _id: { $ne: exceptId } }
        : { isDefault: true },
      { $set: { isDefault: false } },
    );
  }

  async hasUsers(roleId: string | Types.ObjectId): Promise<boolean> {
    return (await this.userModel.exists({ role: roleId })) !== null;
  }
}

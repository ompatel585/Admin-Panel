import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type PopulateOptions } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { escapeRegex } from '../../common/utils/query.util.js';
import { Role } from './schemas/role.schema.js';

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(@InjectModel(Role.name) roleModel: Model<Role>) {
    super(roleModel);
  }

  /** Case-insensitive exact match. */
  findByName(name: string) {
    return this.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    });
  }

  /** Built-in roles only (those with no owning workspace). */
  findByKey(key: string) {
    return this.findOne({ key, tenant: null });
  }

  findDefault() {
    return this.findOne({ isDefault: true });
  }

  /** A role by id, unless it is hidden. Hidden roles do not exist as far as callers can tell. */
  findVisibleById(id: string, populate?: PopulateOptions | PopulateOptions[]) {
    const query = this.model.findOne({ _id: id, isHidden: { $ne: true } });
    return populate ? query.populate(populate) : query;
  }

  hideAdminRoles() {
    return this.model.updateMany(
      { isAdmin: true, isHidden: { $ne: true } },
      { $set: { isHidden: true } },
    );
  }

  async hasUsers(roleId: string): Promise<boolean> {
    const holder = await this.model.db
      .collection('users')
      .findOne(
        { role: new Types.ObjectId(roleId), deletedAt: null },
        { projection: { _id: 1 } },
      );
    return holder !== null;
  }

  findAdmin() {
    return this.findOne({ isAdmin: true });
  }

  /**
   * One-off upgrade of data written before the Admin/User model: roles flagged
   * with the old `isSuperAdmin` become (or fold into) the Admin role and their
   * users move over. Uses the raw collections because the field is no longer
   * part of the schema. Returns how many legacy roles were migrated.
   */
  async migrateLegacySuperAdmin(): Promise<number> {
    const roles = this.model.collection;
    const users = this.model.db.collection('users');

    const legacy = await roles
      .find({ isSuperAdmin: true, isAdmin: { $ne: true }, deletedAt: null })
      .toArray();
    if (legacy.length === 0) return 0;

    let admin = await roles.findOne({ isAdmin: true, deletedAt: null });
    let obsolete = legacy;
    if (!admin) {
      const [first, ...rest] = legacy;
      await roles.updateOne(
        { _id: first._id },
        {
          $set: { isAdmin: true, isSystem: true, name: 'Admin' },
          $unset: { isSuperAdmin: '' },
        },
      );
      admin = first;
      obsolete = rest;
    }

    const ids = obsolete.map((role) => role._id);
    if (ids.length > 0) {
      await users.updateMany({ role: { $in: ids } }, { $set: { role: admin._id } });
      await roles.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: new Date() } },
      );
    }
    return legacy.length;
  }
}

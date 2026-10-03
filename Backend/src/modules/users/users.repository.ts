import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { User } from './schemas/user.schema.js';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }

  findByEmail(email: string) {
    return this.findOne({ email });
  }

  /** Includes the password hash; for credential checks only. */
  findByEmailWithPassword(email: string) {
    return this.findOne({ email }).select('+passwordHash');
  }

  findByIdWithPassword(id: string | Types.ObjectId) {
    return this.model.findById(id).select('+passwordHash');
  }

  /** User -> role -> active permissions, used to build the request's `AuthUser`. */
  findAuthContext(id: string | Types.ObjectId) {
    return this.model.findById(id).populate({
      path: 'role',
      populate: {
        path: 'permissions',
        match: { isActive: true },
        select: 'key',
      },
    });
  }

  setPassword(id: string | Types.ObjectId, passwordHash: string) {
    return this.model.updateOne({ _id: id }, { $set: { passwordHash } });
  }

  touchLastLogin(id: string | Types.ObjectId) {
    return this.model.updateOne(
      { _id: id },
      { $set: { lastLoginAt: new Date() } },
    );
  }
}

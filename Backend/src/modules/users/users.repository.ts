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
    return this.model.findById(id).populate([
      {
        path: 'role',
        populate: {
          path: 'permissions',
          match: { isActive: true },
          select: 'key',
        },
      },
      // Granted to this person directly, on top of the role.
      { path: 'permissions', match: { isActive: true }, select: 'key' },
      { path: 'tenant', select: 'name slug plan status' },
    ]);
  }

  /**
   * Also ends every older session (`passwordChangedAt`), lifts any lockout, and
   * verifies the email: reaching this point means the person held a valid
   * emailed link or their current password.
   */
  async setPassword(id: string | Types.ObjectId, passwordHash: string) {
    const now = new Date();
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          passwordHash,
          passwordChangedAt: now,
          failedLogins: 0,
          lockedUntil: null,
        },
      },
    );
    await this.model.updateOne(
      { _id: id, emailVerifiedAt: null },
      { $set: { emailVerifiedAt: now } },
    );
  }

  /** Successful sign-in: stamp it and clear the failure counters. */
  touchLastLogin(id: string | Types.ObjectId) {
    return this.model.updateOne(
      { _id: id },
      { $set: { lastLoginAt: new Date(), failedLogins: 0, lockedUntil: null } },
    );
  }

  /** Counts a failed sign-in and locks the account for `lockMinutes` once `maxAttempts` is reached. */
  async recordFailedLogin(
    id: string | Types.ObjectId,
    maxAttempts: number,
    lockMinutes: number,
  ): Promise<void> {
    const user = await this.model.findByIdAndUpdate(
      id,
      { $inc: { failedLogins: 1 } },
      { returnDocument: 'after' },
    );
    if (user && user.failedLogins >= maxAttempts) {
      await this.model.updateOne(
        { _id: id },
        {
          $set: {
            lockedUntil: new Date(Date.now() + lockMinutes * 60_000),
            failedLogins: 0,
          },
        },
      );
    }
  }
}

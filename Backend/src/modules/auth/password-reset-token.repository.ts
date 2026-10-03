import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { PasswordResetToken } from './schemas/password-reset-token.schema.js';

@Injectable()
export class PasswordResetTokenRepository extends BaseRepository<PasswordResetToken> {
  constructor(
    @InjectModel(PasswordResetToken.name) model: Model<PasswordResetToken>,
  ) {
    super(model);
  }

  findValidByHash(tokenHash: string) {
    return this.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
  }

  deleteAllForUser(userId: string | Types.ObjectId) {
    return this.model.deleteMany({ user: userId });
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';

@Schema({ _id: false })
export class UserMfa {
  @Prop({ default: false })
  enabled: boolean;

  /** TOTP secret, encrypted with a key from the secrets manager; never plain text. */
  @Prop({ type: String, select: false, default: null })
  totpSecretEnc: string | null;

  /** SHA-256 of each unused recovery code. */
  @Prop({ type: [String], select: false, default: [] })
  recoveryCodeHashes: string[];
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  /** Never selected by default; opt in with `.select('+passwordHash')`. */
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Role',
    required: true,
    index: true,
  })
  role: Types.ObjectId;

  /** Workspace the user belongs to; null for platform Admins. */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Tenant',
    default: null,
    index: true,
  })
  tenant: Types.ObjectId | null;

  /**
   * Permissions granted to this person directly, on top of whatever their role
   * holds. Only a super admin can change them.
   */
  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissions: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  /** Set once the person has proved they own the address (set-password or reset link). */
  @Prop({ type: Date, default: null })
  emailVerifiedAt: Date | null;

  @Prop({ type: UserMfa, default: () => ({}) })
  mfa: UserMfa;

  /** Consecutive failed sign-ins; reset on success. */
  @Prop({ default: 0 })
  failedLogins: number;

  @Prop({ type: Date, default: null })
  lockedUntil: Date | null;

  /** Sessions issued before this moment are no longer valid. */
  @Prop({ type: Date, default: null })
  passwordChangedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(User),
);
UserSchema.index({ tenant: 1, role: 1 });
// Unique among live users; a soft-deleted user's email can be registered again.
UserSchema.index({ email: 1, deletedAt: 1 }, { unique: true });

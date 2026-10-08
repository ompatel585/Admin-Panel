import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';

export const AUTH_TOKEN_PURPOSES = ['set_password', 'reset_password'] as const;
export type AuthTokenPurpose = (typeof AUTH_TOKEN_PURPOSES)[number];

@Schema({ timestamps: true })
export class PasswordResetToken {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  user: Types.ObjectId;

  /** SHA-256 of the emailed token; the raw token is never stored. */
  @Prop({ required: true, unique: true })
  tokenHash: string;

  /** `set_password` links (new users) live 72 hours; `reset_password` links 1 hour or the configured TTL. */
  @Prop({ type: String, enum: AUTH_TOKEN_PURPOSES, default: 'reset_password' })
  purpose: AuthTokenPurpose;

  /** Stamped when the link is used; single use. */
  @Prop({ type: Date, default: null })
  usedAt: Date | null;

  /** MongoDB removes the document automatically once this time has passed. */
  @Prop({ required: true, expires: 0 })
  expiresAt: Date;
}

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetToken>;
export const PasswordResetTokenSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(PasswordResetToken),
  // Single-use tokens are throwaway rows, not records worth keeping.
  { softDelete: false },
);

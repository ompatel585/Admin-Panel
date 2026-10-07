import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';

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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, trim: true })
  name: string;

  /** Globally unique, e.g. `users` (module) or `users.create` (sub). */
  @Prop({ required: true, trim: true, lowercase: true })
  key: string;

  @Prop({ trim: true, default: '' })
  description: string;

  /** `null` for a top-level (module) permission. */
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Permission',
    default: null,
    index: true,
  })
  parent: Types.ObjectId | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSystem: boolean;
}

export type PermissionDocument = HydratedDocument<Permission>;
export const PermissionSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(Permission),
);
PermissionSchema.index({ key: 1, deletedAt: 1 }, { unique: true });

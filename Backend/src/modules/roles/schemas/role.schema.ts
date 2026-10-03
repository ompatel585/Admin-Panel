import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissions: Types.ObjectId[];

  /** Bypasses every permission check, including ones created later. */
  @Prop({ default: false })
  isSuperAdmin: boolean;

  /** Assigned to new sign-ups (except the very first user). */
  @Prop({ default: false, index: true })
  isDefault: boolean;

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export type RoleDocument = HydratedDocument<Role>;
export const RoleSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(Role),
);

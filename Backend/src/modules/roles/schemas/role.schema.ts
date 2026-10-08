import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';

export const ROLE_SCOPES = ['platform', 'company'] as const;
export type RoleScope = (typeof ROLE_SCOPES)[number];

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, trim: true })
  name: string;

  /** Stable identifier, e.g. `owner` or `super_admin`; the name is only a label. */
  @Prop({ type: String, trim: true, lowercase: true })
  key: string;

  /** `platform` roles belong to your own team (no workspace); `company` roles to a customer's users. */
  @Prop({ type: String, enum: ROLE_SCOPES, default: 'company', index: true })
  scope: RoleScope;

  /** Null for built-in roles; set only for a company's own custom role. */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Tenant', default: null })
  tenant: Types.ObjectId | null;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'Permission' }],
    default: [],
  })
  permissions: Types.ObjectId[];

  /** Platform operator: bypasses every permission check and sees every tenant. */
  @Prop({ default: false })
  isAdmin: boolean;

  /**
   * Never shown to anyone: excluded from every roles listing and lookup. Set
   * on the super admin role so its name, description and permissions stay private.
   */
  @Prop({ default: false })
  isHidden: boolean;

  /** Assigned to new sign-ups (except the very first user, who becomes Admin). */
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
RoleSchema.index({ name: 1, deletedAt: 1 }, { unique: true });
// Partial so roles written before `key` existed (no key yet) do not collide before the backfill runs.
RoleSchema.index(
  { tenant: 1, key: 1, deletedAt: 1 },
  { unique: true, partialFilterExpression: { key: { $type: 'string' } } },
);

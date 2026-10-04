import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';
import {
  TENANT_PLANS,
  TENANT_STATUSES,
  type TenantPlan,
  type TenantStatus,
} from '../constants/tenants.constants.js';

/** A customer workspace: owns websites, crawl jobs and users. */
@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ type: String, enum: TENANT_PLANS, default: 'free' })
  plan: TenantPlan;

  @Prop({ type: String, enum: TENANT_STATUSES, default: 'active', index: true })
  status: TenantStatus;
}

export type TenantDocument = HydratedDocument<Tenant>;
export const TenantSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(Tenant),
);

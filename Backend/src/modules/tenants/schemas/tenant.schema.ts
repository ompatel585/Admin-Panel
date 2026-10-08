import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { applyBaseSchemaOptions } from '../../../database/schema.options.js';
import {
  DEFAULT_RETENTION_DAYS,
  PLAN_LIMITS,
  TENANT_PLANS,
  TENANT_STATUSES,
  type TenantPlan,
  type TenantStatus,
} from '../constants/tenants.constants.js';

/** The main person at the company. */
@Schema({ _id: false })
export class TenantContact {
  @Prop({ type: String, trim: true, default: '' })
  name: string;

  @Prop({ type: String, trim: true, lowercase: true, default: '' })
  email: string;

  @Prop({ type: String, trim: true, default: '' })
  phone: string;
}

/** Usage caps that control AI cost. Platform defaults per plan, adjustable per customer by the platform team. */
@Schema({ _id: false })
export class TenantLimits {
  @Prop({ required: true })
  maxSites: number;

  @Prop({ required: true })
  maxPagesPerSite: number;

  @Prop({ required: true })
  maxSources: number;

  @Prop({ required: true })
  monthlyMessages: number;

  @Prop({ required: true })
  maxStorageMb: number;
}

@Schema({ _id: false })
export class TenantSettings {
  /** The owner may change this within 30-365 days. */
  @Prop({ default: DEFAULT_RETENTION_DAYS, min: 30, max: 365 })
  retentionDays: number;

  /** Platform team only. */
  @Prop({ type: String, default: null })
  defaultLlmModel: string | null;

  /** Platform team only. */
  @Prop({ type: String, default: null })
  dataRegion: string | null;
}

/** A customer workspace: owns websites, crawl jobs and users. */
@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ type: String, enum: TENANT_PLANS, default: 'free' })
  plan: TenantPlan;

  @Prop({ type: String, enum: TENANT_STATUSES, default: 'active', index: true })
  status: TenantStatus;

  @Prop({ type: TenantContact, default: () => ({}) })
  contact: TenantContact;

  /** Copied from the plan when the workspace is created; the platform team may change it afterwards. */
  @Prop({
    type: TenantLimits,
    default: function (this: { plan?: TenantPlan }) {
      return { ...PLAN_LIMITS[this.plan ?? 'free'] };
    },
  })
  limits: TenantLimits;

  @Prop({ type: TenantSettings, default: () => ({}) })
  settings: TenantSettings;

  /** Window in which the platform team may read this workspace's conversations; set by the owner. */
  @Prop({ type: Date, default: null })
  supportAccessUntil: Date | null;

  /** The platform admin who created it; null for self sign-ups. */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;
}

export type TenantDocument = HydratedDocument<Tenant>;
export const TenantSchema = applyBaseSchemaOptions(
  SchemaFactory.createForClass(Tenant),
);
TenantSchema.index({ slug: 1, deletedAt: 1 }, { unique: true });

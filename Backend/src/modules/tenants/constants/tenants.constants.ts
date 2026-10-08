import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const TENANT_PLANS = ['free', 'pro', 'enterprise'] as const;
export type TenantPlan = (typeof TENANT_PLANS)[number];

export const TENANT_STATUSES = ['active', 'suspended'] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export interface TenantLimitValues {
  maxSites: number;
  maxPagesPerSite: number;
  maxSources: number;
  monthlyMessages: number;
  maxStorageMb: number;
}

/**
 * Starting limits for each plan. They are copied onto the tenant when it is
 * created (and backfilled for older tenants); after that the tenant's own
 * `limits` are what is enforced, so the platform team can adjust one customer.
 */
export const PLAN_LIMITS: Record<TenantPlan, TenantLimitValues> = {
  free: {
    maxSites: 1,
    maxPagesPerSite: 50,
    maxSources: 5,
    monthlyMessages: 500,
    maxStorageMb: 100,
  },
  pro: {
    maxSites: 5,
    maxPagesPerSite: 1000,
    maxSources: 50,
    monthlyMessages: 10_000,
    maxStorageMb: 2_000,
  },
  enterprise: {
    maxSites: 50,
    maxPagesPerSite: 20000,
    maxSources: 500,
    monthlyMessages: 200_000,
    maxStorageMb: 50_000,
  },
};

/** How long chats are kept unless the owner picks another period (30-365 days). */
export const DEFAULT_RETENTION_DAYS = 90;

export const TENANT_ERRORS = defineErrors({
  NOT_FOUND: {
    code: 'TENANT_NOT_FOUND',
    message: 'Workspace not found',
    status: HttpStatus.NOT_FOUND,
  },
  NO_WORKSPACE: {
    code: 'TENANT_NO_WORKSPACE',
    message: 'Your account is not attached to a workspace',
    status: HttpStatus.FORBIDDEN,
  },
  TENANT_REQUIRED: {
    code: 'TENANT_REQUIRED',
    message: 'Select the workspace this belongs to',
    status: HttpStatus.BAD_REQUEST,
  },
  PLAN_FORBIDDEN: {
    code: 'TENANT_PLAN_FORBIDDEN',
    message: 'Only an Admin can change a workspace plan',
    status: HttpStatus.FORBIDDEN,
  },
});

export const TENANT_MESSAGES = {
  FETCHED: 'Workspaces fetched',
  CREATED: 'Workspace created',
  UPDATED: 'Workspace updated',
  DELETED: 'Workspace deleted',
  STATUS_UPDATED: 'Workspace status updated',
} as const;

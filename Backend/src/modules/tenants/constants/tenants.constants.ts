import { HttpStatus } from '@nestjs/common';
import { defineErrors } from '../../../common/exceptions/app.exception.js';

export const TENANT_PLANS = ['free', 'pro', 'enterprise'] as const;
export type TenantPlan = (typeof TENANT_PLANS)[number];

export const TENANT_STATUSES = ['active', 'suspended'] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

/** What each plan allows; enforced when a tenant adds websites. */
export const PLAN_LIMITS: Record<
  TenantPlan,
  { maxSites: number; maxPagesPerSite: number }
> = {
  free: { maxSites: 1, maxPagesPerSite: 50 },
  pro: { maxSites: 5, maxPagesPerSite: 1000 },
  enterprise: { maxSites: 50, maxPagesPerSite: 20000 },
};

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

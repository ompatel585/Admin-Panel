import type { ListParams } from "./api";

export type TenantPlan = "free" | "pro" | "enterprise";
export type TenantStatus = "active" | "suspended";

export interface PlanLimits {
  maxSites: number;
  maxPagesPerSite: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  limits: PlanLimits;
  usage?: { sites: number; users: number };
  createdAt: string;
}

export interface TenantOption {
  id: string;
  name: string;
  slug: string;
}

export interface CreateTenantRequest {
  name: string;
  plan?: TenantPlan;
}

export type UpdateTenantRequest = Partial<CreateTenantRequest>;

export interface TenantListParams extends ListParams {
  status?: TenantStatus;
  plan?: TenantPlan;
}

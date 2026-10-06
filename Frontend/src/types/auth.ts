import type { TenantPlan, TenantStatus } from "./tenant";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; isAdmin: boolean } | null;
  /** The signed-in user's workspace; null for platform Admins. */
  tenant: { id: string; name: string; slug: string; plan: TenantPlan; status: TenantStatus } | null;
  /** Permission keys held. Empty for Admin, who bypasses checks. */
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; isSuperAdmin: boolean } | null;
  /** Permission keys held. Empty for Super Admin, who bypasses checks. */
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

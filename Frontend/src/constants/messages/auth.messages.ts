import { defineMessages } from "./messages.master";

export const authMessages = defineMessages({
  errors: {
    AUTH_INVALID_CREDENTIALS: "Incorrect email or password.",
    AUTH_ACCOUNT_DISABLED: "This account has been deactivated. Contact an administrator.",
    AUTH_EMAIL_TAKEN: "An account with this email already exists.",
    AUTH_SESSION_INVALID: "Your session has expired. Please sign in again.",
    AUTH_RESET_TOKEN_INVALID: "This reset link is invalid or has expired. Request a new one.",
    AUTH_CURRENT_PASSWORD_INCORRECT: "Your current password is incorrect.",
    AUTH_DEFAULT_ROLE_MISSING: "Sign-up is unavailable right now. Contact an administrator.",
  },
  success: {
    login: "Welcome back!",
    signup: "Your account has been created.",
    logout: "You've been signed out.",
    forgotPassword: "If that email is registered, a reset link is on its way.",
    resetPassword: "Password updated. You can sign in now.",
    changePassword: "Password changed.",
    updateProfile: "Profile updated.",
  },
});

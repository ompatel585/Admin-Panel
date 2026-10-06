import * as yup from "yup";
import { rules } from "./rules";

export const loginSchema = yup.object({
  email: rules.email(),
  password: rules.anyPassword(),
});

export const signupSchema = yup.object({
  name: rules.text("Name", 80),
  email: rules.email(),
  password: rules.password(),
  confirmPassword: rules.confirmPassword("password"),
});

export const forgotPasswordSchema = yup.object({
  email: rules.email(),
});

export const resetPasswordSchema = yup.object({
  password: rules.password("New password"),
  confirmPassword: rules.confirmPassword("password"),
});

export const profileSchema = yup.object({
  name: rules.text("Name", 80),
  email: rules.email(),
});

export const changePasswordSchema = yup.object({
  currentPassword: rules.anyPassword("Current password"),
  newPassword: rules.password("New password"),
  confirmPassword: rules.confirmPassword("newPassword"),
});

export type LoginValues = yup.InferType<typeof loginSchema>;
export type SignupValues = yup.InferType<typeof signupSchema>;
export type ForgotPasswordValues = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordValues = yup.InferType<typeof resetPasswordSchema>;
export type ProfileValues = yup.InferType<typeof profileSchema>;
export type ChangePasswordValues = yup.InferType<typeof changePasswordSchema>;

import * as yup from "yup";
import { rules } from "./rules";

export const createUserSchema = yup.object({
  name: rules.text("Name", 80),
  email: rules.email(),
  password: rules.password(),
  roleId: rules.requiredSelect("Role"),
  isActive: rules.boolean(),
});

export const updateUserSchema = yup.object({
  name: rules.text("Name", 80),
  email: rules.email(),
});

export type CreateUserValues = yup.InferType<typeof createUserSchema>;
export type UpdateUserValues = yup.InferType<typeof updateUserSchema>;

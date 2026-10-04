import * as yup from "yup";
import { rules } from "./rules";

export const roleSchema = yup.object({
  name: rules.text("Role name", 50),
  description: rules.optionalText("Description", 200),
  isActive: rules.boolean(),
});

export type RoleValues = yup.InferType<typeof roleSchema>;

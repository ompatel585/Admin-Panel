import * as yup from "yup";
import { rules } from "./rules";

export const roleSchema = yup.object({
  name: rules.text("Role name", 50),
  description: rules.optionalText("Description"),
  isActive: rules.boolean(),
  isDefault: rules.boolean(),
  permissionIds: yup.array(yup.string().required()).required(),
});

export type RoleValues = yup.InferType<typeof roleSchema>;

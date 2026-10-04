import * as yup from "yup";
import { rules } from "./rules";

export const tenantSchema = yup.object({
  name: rules.text("Workspace name", 80),
  plan: rules.requiredSelect("Plan"),
});

export type TenantValues = yup.InferType<typeof tenantSchema>;

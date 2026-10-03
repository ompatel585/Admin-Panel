import * as yup from "yup";
import { VALIDATION_MESSAGES as msg } from "@/constants/messages";
import { rules } from "./rules";

const SEGMENT = /^[a-z][a-z0-9_]*$/;

/**
 * `parentKey` is the selected module's key when creating a sub-permission,
 * or undefined for a top-level module permission.
 */
export const buildPermissionSchema = (parentKey?: string) =>
  yup.object({
    name: rules.text("Name", 60),
    key: yup
      .string()
      .trim()
      .lowercase()
      .required(msg.required("Key"))
      .test("key-format", parentKey ? msg.subPermissionKey(parentKey) : msg.permissionKey, (value) => {
        if (!value) return false;
        if (!parentKey) return SEGMENT.test(value);
        return value.startsWith(`${parentKey}.`) && SEGMENT.test(value.slice(parentKey.length + 1));
      }),
    description: rules.optionalText("Description"),
    isActive: rules.boolean(),
  });

export const updatePermissionSchema = yup.object({
  name: rules.text("Name", 60),
  description: rules.optionalText("Description"),
  isActive: rules.boolean(),
});

export type PermissionValues = yup.InferType<ReturnType<typeof buildPermissionSchema>>;
export type UpdatePermissionValues = yup.InferType<typeof updatePermissionSchema>;

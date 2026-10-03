import { defineMessages } from "./messages.master";

export const permissionsMessages = defineMessages({
  errors: {
    PERMISSION_NOT_FOUND: "That permission no longer exists.",
    PERMISSION_PARENT_NOT_FOUND: "The parent permission no longer exists.",
    PERMISSION_KEY_TAKEN: "A permission with this key already exists.",
    PERMISSION_INVALID_KEY: "Use lowercase letters, numbers and underscores, e.g. reports.export.",
    PERMISSION_KEY_PARENT_MISMATCH: "A sub-permission key must start with its parent's key, e.g. reports.export.",
    PERMISSION_NESTING_TOO_DEEP: "Permissions support one level of sub-permissions.",
    PERMISSION_HAS_CHILDREN: "Delete this permission's sub-permissions first.",
    PERMISSION_IN_USE: "This permission is assigned to a role. Remove it from the role first.",
    PERMISSION_SYSTEM_PROTECTED: "System permissions can't be deactivated or deleted.",
  },
  success: {
    createPermission: "Permission created.",
    updatePermission: "Permission updated.",
    deletePermission: "Permission deleted.",
  },
});

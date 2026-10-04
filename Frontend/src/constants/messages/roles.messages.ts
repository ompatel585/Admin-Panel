import { defineMessages } from "./messages.master";

export const rolesMessages = defineMessages({
  errors: {
    ROLE_NOT_FOUND: "That role no longer exists.",
    ROLE_NAME_TAKEN: "A role with this name already exists.",
    ROLE_SUPER_ADMIN_ONLY: "Only a super admin can add, edit or delete roles.",
    ROLE_SYSTEM_PROTECTED: "System roles can't be renamed, deactivated or deleted.",
    ROLE_IN_USE: "This role is assigned to users. Reassign them first.",
    ROLE_INVALID_PERMISSIONS: "Some selected permissions no longer exist. Refresh and try again.",
    ROLE_INACTIVE: "That role is inactive and can't be assigned.",
    ROLE_ADMIN_ASSIGN_FORBIDDEN: "Only an administrator can assign the Admin role.",
  },
  success: {
    createRole: "Role created.",
    updateRole: "Role updated.",
    updateRolePermissions: "Role permissions updated.",
    deleteRole: "Role deleted.",
  },
});

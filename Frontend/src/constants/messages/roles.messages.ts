import { defineMessages } from "./messages.master";

export const rolesMessages = defineMessages({
  errors: {
    ROLE_NOT_FOUND: "That role no longer exists.",
    ROLE_NAME_TAKEN: "A role with this name already exists.",
    ROLE_SYSTEM_PROTECTED: "System roles can't be changed this way.",
    ROLE_IN_USE: "This role is assigned to users. Reassign them first.",
    ROLE_INVALID_PERMISSIONS: "Some selected permissions no longer exist. Refresh and try again.",
    ROLE_INACTIVE: "That role is inactive and can't be assigned.",
  },
  success: {
    createRole: "Role created.",
    updateRole: "Role updated.",
    deleteRole: "Role deleted.",
  },
});

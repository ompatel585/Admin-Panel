import { defineMessages } from "./messages.master";

export const usersMessages = defineMessages({
  errors: {
    USER_NOT_FOUND: "That user no longer exists.",
    USER_EMAIL_TAKEN: "Another user already uses this email.",
    USER_PERMISSIONS_ADMIN_ONLY: "Only a super admin can give a user individual permissions.",
    USER_INVALID_PERMISSIONS: "Some selected permissions no longer exist. Refresh and try again.",
    USER_SELF_ACTION_FORBIDDEN: "You can't do that to your own account.",
  },
  success: {
    createUser: "User created.",
    updateUser: "User updated.",
    updateUserStatus: "User status updated.",
    updateUserPermissions: "User permissions updated.",
    updateUserRole: "User role updated.",
    deleteUser: "User deleted.",
  },
});

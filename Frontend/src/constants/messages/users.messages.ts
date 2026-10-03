import { defineMessages } from "./messages.master";

export const usersMessages = defineMessages({
  errors: {
    USER_NOT_FOUND: "That user no longer exists.",
    USER_EMAIL_TAKEN: "Another user already uses this email.",
    USER_SELF_ACTION_FORBIDDEN: "You can't do that to your own account.",
  },
  success: {
    createUser: "User created.",
    updateUser: "User updated.",
    updateUserStatus: "User status updated.",
    updateUserRole: "User role updated.",
    deleteUser: "User deleted.",
  },
});

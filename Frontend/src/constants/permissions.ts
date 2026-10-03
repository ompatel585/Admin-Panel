/**
 * Keys the UI checks to show or hide controls. The permissions themselves
 * (names, hierarchy, who holds them) are managed dynamically through the API;
 * these are only the identifiers the built-in screens refer to.
 */
export const PERMISSIONS = {
  users: { read: "users.read", create: "users.create", update: "users.update", delete: "users.delete" },
  roles: { read: "roles.read", create: "roles.create", update: "roles.update", delete: "roles.delete" },
  permissions: {
    read: "permissions.read",
    create: "permissions.create",
    update: "permissions.update",
    delete: "permissions.delete",
  },
} as const;

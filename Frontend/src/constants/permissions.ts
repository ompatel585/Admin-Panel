/**
 * Keys the UI checks to show or hide controls. The permissions themselves
 * (names, hierarchy, who holds them) are seeded and managed through the API;
 * these are only the identifiers the built-in screens refer to.
 */
export const PERMISSIONS = {
  tenants: {
    read: "tenants.read",
    list: "tenants.list",
    create: "tenants.create",
    update: "tenants.update",
    delete: "tenants.delete",
    suspend: "tenants.suspend",
  },
  sites: { read: "sites.read", create: "sites.create", update: "sites.update", delete: "sites.delete", crawl: "sites.crawl" },
  crawlJobs: { read: "crawl_jobs.read", cancel: "crawl_jobs.cancel" },
  users: { read: "users.read", create: "users.create", update: "users.update", delete: "users.delete" },
  roles: { read: "roles.read", create: "roles.create", update: "roles.update", delete: "roles.delete" },
  permissions: {
    read: "permissions.read",
    create: "permissions.create",
    update: "permissions.update",
    delete: "permissions.delete",
  },
} as const;

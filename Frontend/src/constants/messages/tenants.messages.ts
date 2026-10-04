import { defineMessages } from "./messages.master";

export const tenantsMessages = defineMessages({
  errors: {
    TENANT_NOT_FOUND: "That workspace no longer exists.",
    TENANT_NO_WORKSPACE: "Your account isn't attached to a workspace.",
    TENANT_REQUIRED: "Choose the workspace this belongs to.",
    TENANT_PLAN_FORBIDDEN: "Only an administrator can change a workspace plan.",
    AUTH_WORKSPACE_SUSPENDED: "Your workspace has been suspended. Contact support.",
  },
  success: {
    createTenant: "Workspace created.",
    updateTenant: "Workspace updated.",
    updateTenantStatus: "Workspace status updated.",
    deleteTenant: "Workspace deleted.",
  },
});

import { authMessages } from "./auth.messages";
import { commonMessages } from "./common.messages";
import { crawlJobsMessages } from "./crawl-jobs.messages";
import { mergeMessages } from "./messages.master";
import { permissionsMessages } from "./permissions.messages";
import { rolesMessages } from "./roles.messages";
import { sitesMessages } from "./sites.messages";
import { tenantsMessages } from "./tenants.messages";
import { usersMessages } from "./users.messages";

const merged = mergeMessages([
  commonMessages,
  authMessages,
  usersMessages,
  rolesMessages,
  permissionsMessages,
  tenantsMessages,
  sitesMessages,
  crawlJobsMessages,
]);

export const ERROR_MESSAGES = merged.errors;
export const SUCCESS_MESSAGES = merged.success;
export { VALIDATION_MESSAGES } from "./validation.messages";

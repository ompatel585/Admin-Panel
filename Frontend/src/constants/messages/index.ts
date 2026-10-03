import { authMessages } from "./auth.messages";
import { commonMessages } from "./common.messages";
import { mergeMessages } from "./messages.master";
import { permissionsMessages } from "./permissions.messages";
import { rolesMessages } from "./roles.messages";
import { usersMessages } from "./users.messages";

const merged = mergeMessages([
  commonMessages,
  authMessages,
  usersMessages,
  rolesMessages,
  permissionsMessages,
]);

export const ERROR_MESSAGES = merged.errors;
export const SUCCESS_MESSAGES = merged.success;
export { VALIDATION_MESSAGES } from "./validation.messages";

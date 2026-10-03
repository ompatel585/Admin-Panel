import { SetMetadata } from '@nestjs/common';
import { PREVENT_SELF_ACTION_KEY } from '../constants/users.constants.js';

/** The `:id` in the route must not be the caller's own account. */
export const PreventSelfAction = () =>
  SetMetadata(PREVENT_SELF_ACTION_KEY, true);

import { isFulfilled, isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { normalizeApiError } from "@/lib/errors/api-error";
import { notify } from "@/lib/notify/notify";
import { baseApi } from "@/services/api/baseApi";

interface QueryMeta {
  endpointName?: string;
  type?: "query" | "mutation";
}

/** Endpoints whose failures are part of normal control flow, not worth a toast. */
const SILENT_ENDPOINTS = new Set(["getMe"]);
/** A 401 here means "wrong credentials", not "session expired". */
const CREDENTIAL_ENDPOINTS = new Set(["login", "signup", "changePassword"]);

/**
 * The ONE place API outcomes become toasts:
 *   rejected  -> `notify.error(<message for the error code>)`
 *   fulfilled mutation -> `notify.success(<message for the endpoint>)`
 * Components just call hooks; they never format or show feedback themselves.
 */
export const feedbackMiddleware: Middleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { endpointName } = (action.meta.arg ?? {}) as QueryMeta;
    const error = normalizeApiError(action.payload);

    if (endpointName && !SILENT_ENDPOINTS.has(endpointName)) {
      if (error.status === 401 && !CREDENTIAL_ENDPOINTS.has(endpointName)) {
        // Session died mid-use: re-check it so route guards send the user to login.
        store.dispatch(baseApi.util.invalidateTags(["Me"]));
      } else {
        notify.error(error.message);
      }
    }
  }

  if (isFulfilled(action)) {
    const { endpointName, type } = (action.meta.arg ?? {}) as QueryMeta;
    if (type === "mutation" && endpointName) {
      const message = SUCCESS_MESSAGES[endpointName];
      if (message) notify.success(message);
    }
  }

  return next(action);
};

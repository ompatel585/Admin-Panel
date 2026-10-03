import { ERROR_MESSAGES } from "@/constants/messages";
import type { ApiErrorBody } from "@/types/api";

export interface NormalizedApiError {
  /** HTTP status, or 0 when there was no response (network failure). */
  status: number;
  /** Machine-readable code from the API, or a client-side one. */
  code: string;
  /** Final, user-facing text. */
  message: string;
}

const isApiErrorBody = (data: unknown): data is ApiErrorBody =>
  typeof data === "object" && data !== null && "code" in data && "message" in data;

/**
 * Turns anything an RTK Query call can reject with into one shape.
 * Message priority: our copy for the code -> a 4xx server message -> generic.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  const unknown = {
    status: 0,
    code: "UNKNOWN_ERROR",
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
  };
  if (typeof error !== "object" || error === null) return unknown;

  const { status, data } = error as { status?: unknown; data?: unknown };

  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
    return { status: 0, code: "NETWORK_ERROR", message: ERROR_MESSAGES.NETWORK_ERROR };
  }

  if (typeof status === "number" && isApiErrorBody(data)) {
    const known = ERROR_MESSAGES[data.code];
    const serverMessage = status < 500 ? data.message : undefined;
    return {
      status,
      code: data.code,
      message: known ?? serverMessage ?? ERROR_MESSAGES.INTERNAL_ERROR,
    };
  }

  if (typeof status === "number" && status >= 500) {
    return { status, code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR };
  }

  return unknown;
}

export const getErrorMessage = (error: unknown): string => normalizeApiError(error).message;

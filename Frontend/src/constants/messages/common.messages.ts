import { defineMessages } from "./messages.master";

export const commonMessages = defineMessages({
  errors: {
    // From the API
    UNAUTHORIZED: "Please sign in to continue.",
    FORBIDDEN: "You don't have permission to do that.",
    NOT_FOUND: "We couldn't find what you were looking for.",
    VALIDATION_FAILED: "Some of the submitted information is invalid.",
    BAD_REQUEST: "That request couldn't be processed.",
    INVALID_ID: "That link looks invalid.",
    DUPLICATE: "That already exists.",
    INTERNAL_ERROR: "Something went wrong on our side. Please try again.",
    // Raised on the client
    NETWORK_ERROR: "Can't reach the server. Check your connection and try again.",
    UNKNOWN_ERROR: "Something went wrong. Please try again.",
  },
  success: {},
});

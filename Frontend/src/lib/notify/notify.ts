import { toast } from "sonner";
import { TOAST } from "@/constants/ui";

/**
 * MASTER toast API. Every toast in the app goes through here, so duration and
 * look live in one place (`Toaster` is configured in `providers/ToastProvider`).
 * Components never import the toast library directly.
 */
const options = { duration: TOAST.durationMs };

export const notify = {
  success: (message: string) => toast.success(message, options),
  error: (message: string) => toast.error(message, options),
  info: (message: string) => toast.info(message, options),
};

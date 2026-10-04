import { useCallback } from "react";
import { useAuth } from "./useAuth";

/** Permission checks against the keys the API returned for the current user. */
export function usePermissions() {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.role?.isAdmin);
  const held = user?.permissions;

  /** Holds every given permission. */
  const can = useCallback(
    (...keys: string[]) => isAdmin || keys.every((key) => held?.includes(key)),
    [isAdmin, held],
  );

  /** Holds at least one of the given permissions. */
  const canAny = useCallback(
    (...keys: string[]) => isAdmin || keys.some((key) => held?.includes(key)),
    [isAdmin, held],
  );

  return { can, canAny, isAdmin, tenant: user?.tenant ?? null };
}

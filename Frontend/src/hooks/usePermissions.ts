import { useCallback } from "react";
import { useAuth } from "./useAuth";

/** Permission checks against the keys the API returned for the current user. */
export function usePermissions() {
  const { user } = useAuth();
  const isSuperAdmin = Boolean(user?.role?.isSuperAdmin);
  const held = user?.permissions;

  /** Holds every given permission. */
  const can = useCallback(
    (...keys: string[]) =>
      isSuperAdmin || keys.every((key) => held?.includes(key)),
    [isSuperAdmin, held],
  );

  /** Holds at least one of the given permissions. */
  const canAny = useCallback(
    (...keys: string[]) =>
      isSuperAdmin || keys.some((key) => held?.includes(key)),
    [isSuperAdmin, held],
  );

  return { can, canAny, isSuperAdmin };
}

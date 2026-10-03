"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface CanProps {
  /** Must hold all of these. */
  permission?: string | string[];
  /** Must hold at least one of these. */
  anyOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only if the current user holds the permission(s). */
export function Can({ permission, anyOf, fallback = null, children }: CanProps) {
  const { can, canAny } = usePermissions();
  const required = permission === undefined ? [] : Array.isArray(permission) ? permission : [permission];

  const allowed = can(...required) && (!anyOf || canAny(...anyOf));
  return <>{allowed ? children : fallback}</>;
}

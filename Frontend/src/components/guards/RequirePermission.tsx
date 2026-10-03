"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/hooks/usePermissions";

/** Page-level guard: shows an access-denied panel instead of the page. */
export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return (
      <Card>
        <EmptyState message="You don't have permission to view this page." />
      </Card>
    );
  }
  return <>{children}</>;
}

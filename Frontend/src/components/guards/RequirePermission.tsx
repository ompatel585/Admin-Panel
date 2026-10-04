"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";

/** Page-level guard: shows an access-denied panel instead of the page. */
export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return (
      <Card>
        <EmptyState icon={ShieldAlert} title="Access denied" description="You don't have permission to view this page." />
      </Card>
    );
  }
  return <>{children}</>;
}

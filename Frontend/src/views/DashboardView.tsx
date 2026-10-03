"use client";

import { Badge, Card, PageHeader } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

export function DashboardView() {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name ?? ""}`} subtitle="Here's what your account can do." />
      <Card>
        <p style={{ marginTop: 0 }}>
          Role: <Badge tone="primary">{user?.role?.name ?? "None"}</Badge>
        </p>
        {isSuperAdmin ? (
          <p style={{ marginBottom: 0 }}>Super Admin: you have access to everything, including permissions added later.</p>
        ) : user && user.permissions.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {user.permissions.map((key) => (
              <Badge key={key}>{key}</Badge>
            ))}
          </div>
        ) : (
          <p style={{ marginBottom: 0 }}>No permissions have been granted to your role yet. Ask an administrator for access.</p>
        )}
      </Card>
    </>
  );
}

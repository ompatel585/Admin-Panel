import type { ReactNode } from "react";
import { AuthGate } from "@/components/guards/AuthGate";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  );
}

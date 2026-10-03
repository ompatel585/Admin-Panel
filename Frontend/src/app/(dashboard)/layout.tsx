import type { ReactNode } from "react";
import { AuthGate } from "@/components/guards/AuthGate";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGate>
  );
}

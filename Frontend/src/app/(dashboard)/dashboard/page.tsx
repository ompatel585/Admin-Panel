import type { Metadata } from "next";
import { DashboardView } from "@/views/DashboardView";

export const metadata: Metadata = { title: "Dashboard · Admin Panel" };

export default function Page() {
  return <DashboardView />;
}

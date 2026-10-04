import type { Metadata } from "next";
import { DashboardView } from "@/views/DashboardView";

export const metadata: Metadata = { title: "Dashboard · RAG Console" };

export default function Page() {
  return <DashboardView />;
}

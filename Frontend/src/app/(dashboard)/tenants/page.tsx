import type { Metadata } from "next";
import { TenantsView } from "@/views/TenantsView";

export const metadata: Metadata = { title: "Workspaces · RAG Console" };

export default function Page() {
  return <TenantsView />;
}

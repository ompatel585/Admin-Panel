import type { Metadata } from "next";
import { RolesView } from "@/views/RolesView";

export const metadata: Metadata = { title: "Roles · RAG Console" };

export default function Page() {
  return <RolesView />;
}

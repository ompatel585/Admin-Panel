import type { Metadata } from "next";
import { PermissionsView } from "@/views/PermissionsView";

export const metadata: Metadata = { title: "Permissions · RAG Console" };

export default function Page() {
  return <PermissionsView />;
}

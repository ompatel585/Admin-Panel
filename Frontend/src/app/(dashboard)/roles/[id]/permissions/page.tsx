import type { Metadata } from "next";
import { RolePermissionsView } from "@/views/RolePermissionsView";

export const metadata: Metadata = { title: "Role permissions · RAG Console" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RolePermissionsView roleId={id} />;
}

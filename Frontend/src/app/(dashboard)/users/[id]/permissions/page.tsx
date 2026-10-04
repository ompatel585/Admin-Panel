import type { Metadata } from "next";
import { UserPermissionsView } from "@/views/UserPermissionsView";

export const metadata: Metadata = { title: "User permissions · RAG Console" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserPermissionsView userId={id} />;
}

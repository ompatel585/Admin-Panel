import type { Metadata } from "next";
import { ProfileView } from "@/views/ProfileView";

export const metadata: Metadata = { title: "Profile · RAG Console" };

export default function Page() {
  return <ProfileView />;
}

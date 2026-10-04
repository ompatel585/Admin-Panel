import type { Metadata } from "next";
import { UsersView } from "@/views/UsersView";

export const metadata: Metadata = { title: "Users · RAG Console" };

export default function Page() {
  return <UsersView />;
}

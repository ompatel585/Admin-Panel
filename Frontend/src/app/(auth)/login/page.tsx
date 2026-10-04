import type { Metadata } from "next";
import { LoginView } from "@/views/LoginView";

export const metadata: Metadata = { title: "Sign in · RAG Console" };

export default function Page() {
  return <LoginView />;
}

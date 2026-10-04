import type { Metadata } from "next";
import { SignupView } from "@/views/SignupView";

export const metadata: Metadata = { title: "Create account · RAG Console" };

export default function Page() {
  return <SignupView />;
}

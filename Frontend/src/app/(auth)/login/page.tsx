import type { Metadata } from "next";
import { LoginView } from "@/views/LoginView";

export const metadata: Metadata = { title: "Sign in · Admin Panel" };

export default function Page() {
  return <LoginView />;
}

import type { Metadata } from "next";
import { SignupView } from "@/views/SignupView";

export const metadata: Metadata = { title: "Create account · Admin Panel" };

export default function Page() {
  return <SignupView />;
}

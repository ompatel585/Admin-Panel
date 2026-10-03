import type { Metadata } from "next";
import { ForgotPasswordView } from "@/views/ForgotPasswordView";

export const metadata: Metadata = { title: "Forgot password · Admin Panel" };

export default function Page() {
  return <ForgotPasswordView />;
}

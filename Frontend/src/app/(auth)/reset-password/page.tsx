import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/Spinner";
import { ResetPasswordView } from "@/views/ResetPasswordView";

export const metadata: Metadata = { title: "Reset password · Admin Panel" };

export default function Page() {
  // `useSearchParams` needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={<PageSpinner />}>
      <ResetPasswordView />
    </Suspense>
  );
}

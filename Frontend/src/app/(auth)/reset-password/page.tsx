import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/shared/page-spinner";
import { ResetPasswordView } from "@/views/ResetPasswordView";

export const metadata: Metadata = { title: "Reset password · RAG Console" };

export default function Page() {
  // `useSearchParams` needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={<PageSpinner />}>
      <ResetPasswordView />
    </Suspense>
  );
}

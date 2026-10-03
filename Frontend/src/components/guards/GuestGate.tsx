"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageSpinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

/** For login/signup/reset pages: signed-in users are redirected into the app. */
export function GuestGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.replace(ROUTES.dashboard);
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) return <PageSpinner />;
  return <>{children}</>;
}

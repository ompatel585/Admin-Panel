"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageSpinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

/** Renders children only for a signed-in user; otherwise sends them to the login page. */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(ROUTES.login);
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return <PageSpinner />;
  return <>{children}</>;
}

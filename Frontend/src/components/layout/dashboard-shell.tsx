"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeSidebar, toggleSidebar } from "@/store/slices/uiSlice";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "./theme-toggle";

/** App frame: permission-aware sidebar, top bar with workspace + user menu, content area. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { user } = useAuth();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace(ROUTES.login);
    } catch {
      // Already reported by the feedback middleware; stay signed in.
    }
  };

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 border-r lg:translate-x-0 ${sidebarOpen ? "" : "-translate-x-full"}`}
      >
        <AppSidebar onNavigate={() => dispatch(closeSidebar())} />
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => dispatch(closeSidebar())} aria-hidden />
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => dispatch(toggleSidebar())}>
            <Menu />
          </Button>

          <div className="flex min-w-0 items-center gap-2 text-sm">
            {user?.tenant ? (
              <>
                <span className="truncate font-medium">{user.tenant.name}</span>
                <StatusBadge status={user.tenant.plan} />
              </>
            ) : (
              <span className="font-medium">Platform admin</span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="h-9 gap-2 px-2" aria-label="Account menu" />}>
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden text-left text-sm leading-tight sm:block">
                  <span className="block font-medium">{user?.name}</span>
                  <span className="block text-xs text-muted-foreground">{user?.role?.name ?? "No role"}</span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">{user?.email}</div>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

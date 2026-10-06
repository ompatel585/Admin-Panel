"use client";

import { LogOut, Menu, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
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
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu" />}>
                <UserAvatar name={user?.name} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0">
                <div className="flex items-center gap-3 border-b p-4">
                  <UserAvatar name={user?.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user?.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">{user?.role?.name ?? "No role"}</p>
                  </div>
                </div>
                <div className="p-1">
                  <DropdownMenuItem className="gap-3 px-3 py-2" onClick={() => router.push(ROUTES.profile)}>
                    <Pencil /> Edit profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3 px-3 py-2" onClick={handleLogout}>
                    <LogOut /> Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="w-full p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

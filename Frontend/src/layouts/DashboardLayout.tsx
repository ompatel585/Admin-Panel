"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useLogoutMutation } from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeSidebar, toggleSidebar } from "@/store/slices/uiSlice";
import styles from "./DashboardLayout.module.css";

/** App frame: permission-aware sidebar, top bar with the user menu, content area. */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { user } = useAuth();
  const { can } = usePermissions();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  // Close the mobile drawer after navigating.
  useEffect(() => {
    dispatch(closeSidebar());
  }, [pathname, dispatch]);

  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace(ROUTES.login);
    } catch {
      // Failure was already reported by the feedback middleware; stay signed in.
    }
  };

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>Admin Panel</div>
        <nav className={styles.nav} aria-label="Main">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {sidebarOpen && <div className={styles.backdrop} onClick={() => dispatch(closeSidebar())} />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <Button
            variant="ghost"
            className={styles.menuButton}
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle navigation"
          >
            ☰
          </Button>
          <div className={styles.userBox}>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>{user?.role?.name ?? "No role"}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout} loading={loggingOut}>
              Sign out
            </Button>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

"use client";

import { Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

/** Sidebar built from `NAV_SECTIONS`: each user only sees what their permissions allow. */
export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can, isAdmin } = usePermissions();

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => (!item.permission || can(item.permission)) && !(item.workspaceOnly && isAdmin),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link href={ROUTES.dashboard} className="flex h-14 items-center gap-2 border-b px-4 font-semibold" onClick={onNavigate}>
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </span>
        RAG Console
      </Link>
      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Main">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{section.label}</p>
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}

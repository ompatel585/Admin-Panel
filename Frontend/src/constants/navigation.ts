import {
  Building2,
  Globe,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Palette,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PERMISSIONS } from "./permissions";
import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hidden unless the user holds this permission. Omit for "any signed-in user". */
  permission?: string;
  /** Hidden for platform Admins, who have no workspace of their own. */
  workspaceOnly?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard }],
  },
  {
    label: "Knowledge base",
    items: [
      { label: "Websites", href: ROUTES.sites, icon: Globe, permission: PERMISSIONS.sites.read },
      { label: "Widget", href: ROUTES.widget, icon: Palette, permission: PERMISSIONS.sites.update },
      { label: "Crawl jobs", href: ROUTES.crawlJobs, icon: ListChecks, permission: PERMISSIONS.crawlJobs.read },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Workspaces", href: ROUTES.tenants, icon: Building2, permission: PERMISSIONS.tenants.list },
      { label: "Settings", href: ROUTES.settings, icon: Settings, permission: PERMISSIONS.tenants.read, workspaceOnly: true },
    ],
  },
  {
    label: "Access",
    items: [
      { label: "Users", href: ROUTES.users, icon: Users, permission: PERMISSIONS.users.read },
      { label: "Roles", href: ROUTES.roles, icon: ShieldCheck, permission: PERMISSIONS.roles.read },
      { label: "Permissions", href: ROUTES.permissions, icon: KeyRound, permission: PERMISSIONS.permissions.read },
    ],
  },
];

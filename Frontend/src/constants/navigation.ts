import { PERMISSIONS } from "./permissions";
import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  /** Hidden unless the user holds this permission. Omit for "any signed-in user". */
  permission?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "Users", href: ROUTES.users, permission: PERMISSIONS.users.read },
  { label: "Roles", href: ROUTES.roles, permission: PERMISSIONS.roles.read },
  { label: "Permissions", href: ROUTES.permissions, permission: PERMISSIONS.permissions.read },
];

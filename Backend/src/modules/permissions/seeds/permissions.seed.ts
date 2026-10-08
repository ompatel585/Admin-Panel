import { PERMISSION_KEYS as K } from '../constants/permissions.constants.js';

export interface PermissionSeed {
  key: string;
  name: string;
  description: string;
  /** Overrides the module's scope for this one key. */
  scope?: 'platform' | 'company';
}

export interface PermissionModuleSeed extends PermissionSeed {
  /** Defaults to `company`. */
  scope?: 'platform' | 'company';
  children: PermissionSeed[];
}

const sub = (
  key: string,
  name: string,
  description: string,
  scope?: 'platform' | 'company',
) => ({
  key,
  name,
  description,
  ...(scope && { scope }),
});

/**
 * Bootstrap catalog. The seeder creates whatever is missing and never
 * overwrites a permission an admin has since edited. Add a module here (and to
 * `roles/seeds/roles.seed.ts` if the User role should get it) and it appears
 * on the next boot.
 */
export const PERMISSION_SEEDS: PermissionModuleSeed[] = [
  {
    key: K.TENANTS.MODULE,
    name: 'Workspaces',
    description: 'Tenant workspaces on the platform',
    children: [
      sub(K.TENANTS.READ, 'View workspace', 'View your own workspace'),
      sub(K.TENANTS.LIST, 'List workspaces', 'See every workspace on the platform', 'platform'),
      sub(K.TENANTS.CREATE, 'Create workspaces', 'Create a workspace for a customer', 'platform'),
      sub(K.TENANTS.UPDATE, 'Edit workspace', 'Edit workspace name and plan'),
      sub(K.TENANTS.SUSPEND, 'Suspend workspaces', 'Suspend or reactivate a workspace', 'platform'),
      sub(K.TENANTS.DELETE, 'Delete workspaces', 'Delete a workspace and all of its data', 'platform'),
    ],
  },
  {
    key: K.SITES.MODULE,
    name: 'Websites',
    description: 'Websites whose content is crawled and indexed',
    children: [
      sub(K.SITES.READ, 'View websites', 'View websites and their indexing status'),
      sub(K.SITES.CREATE, 'Add websites', 'Add a website to be crawled and indexed'),
      sub(K.SITES.UPDATE, 'Edit websites', 'Edit website details and crawl settings'),
      sub(K.SITES.CRAWL, 'Trigger crawls', 'Start a re-crawl and re-index of a website'),
      sub(K.SITES.DELETE, 'Delete websites', 'Remove a website and its indexed data'),
    ],
  },
  {
    key: K.CRAWL_JOBS.MODULE,
    name: 'Crawl jobs',
    description: 'Crawling and indexing pipeline runs',
    children: [
      sub(K.CRAWL_JOBS.READ, 'View crawl jobs', 'View crawl and indexing job history'),
      sub(K.CRAWL_JOBS.CANCEL, 'Cancel crawl jobs', 'Cancel a queued or running job'),
    ],
  },
  {
    key: K.USERS.MODULE,
    name: 'Users',
    description: 'Accounts that can sign in',
    children: [
      sub(K.USERS.READ, 'View users', 'View users'),
      sub(K.USERS.CREATE, 'Create users', 'Create users'),
      sub(K.USERS.UPDATE, 'Edit users', 'Edit users, their status and role'),
      sub(K.USERS.DELETE, 'Delete users', 'Delete users'),
    ],
  },
  {
    key: K.ROLES.MODULE,
    name: 'Roles',
    description: 'What each role is allowed to do',
    children: [
      sub(K.ROLES.READ, 'View roles', 'View roles and their permissions'),
      sub(K.ROLES.CREATE, 'Create roles', 'Add a role (super admin only)'),
      sub(K.ROLES.UPDATE, 'Edit roles', 'Edit a role and change which permissions it holds'),
      sub(K.ROLES.DELETE, 'Delete roles', 'Delete a role (super admin only)'),
    ],
  },
  {
    key: K.PERMISSIONS.MODULE,
    name: 'Permissions',
    description: 'The permission catalog itself',
    children: [
      sub(K.PERMISSIONS.READ, 'View permissions', 'View the permission catalog'),
      sub(K.PERMISSIONS.CREATE, 'Create permissions', 'Add permissions'),
      sub(K.PERMISSIONS.UPDATE, 'Edit permissions', 'Edit or deactivate permissions'),
      sub(K.PERMISSIONS.DELETE, 'Delete permissions', 'Delete permissions'),
    ],
  },
];

/**
 * Modules that used to exist. The seeder deletes them (and the sub-permissions
 * under them) and revokes them from every role, so a database created by an
 * older version converges on the current catalog.
 */
export const RETIRED_PERMISSION_MODULES = ['chatbots', 'conversations'];

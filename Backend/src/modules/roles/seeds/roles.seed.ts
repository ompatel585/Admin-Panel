import { PERMISSION_KEYS as K } from '../../permissions/constants/permissions.constants.js';

export interface RoleSeed {
  name: string;
  description: string;
  isAdmin: boolean;
  /** Invisible to everyone through the API (see `Role.isHidden`). */
  isHidden: boolean;
  isDefault: boolean;
  /**
   * Granted once, when the role is first created; afterwards they are edited
   * from the Roles screen. Admin needs none: its access is implicit.
   */
  permissions: string[];
}

/** The platform has exactly these two roles. */
export const ROLE_SEEDS: RoleSeed[] = [
  {
    name: 'Admin',
    description:
      'Platform operator: manages every workspace and holds all permissions, including ones added later',
    isAdmin: true,
    isHidden: true,
    isDefault: false,
    permissions: [],
  },
  {
    name: 'User',
    description:
      'Workspace owner: manages their own websites and crawls',
    isAdmin: false,
    isHidden: false,
    isDefault: true,
    permissions: [
      K.TENANTS.READ,
      K.TENANTS.UPDATE,
      K.SITES.READ,
      K.SITES.CREATE,
      K.SITES.UPDATE,
      K.SITES.CRAWL,
      K.SITES.DELETE,
      K.CRAWL_JOBS.READ,
      K.CRAWL_JOBS.CANCEL,
    ],
  },
];

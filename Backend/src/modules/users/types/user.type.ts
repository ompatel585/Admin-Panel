export const USER_POPULATE = [
  { path: 'role', select: 'name isAdmin isActive isHidden' },
  { path: 'tenant', select: 'name slug' },
];

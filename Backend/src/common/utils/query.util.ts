export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Query-string booleans arrive as strings; map them without `Boolean('false')`. */
export const toBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

export const sortDirection = (order: 'asc' | 'desc'): 1 | -1 =>
  order === 'asc' ? 1 : -1;

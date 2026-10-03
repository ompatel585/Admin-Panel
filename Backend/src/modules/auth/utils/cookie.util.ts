import type { CookieOptions } from 'express';

export const authCookieOptions = (
  isProduction: boolean,
  maxAgeSeconds?: number,
): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  ...(maxAgeSeconds !== undefined && { maxAge: maxAgeSeconds * 1000 }),
});

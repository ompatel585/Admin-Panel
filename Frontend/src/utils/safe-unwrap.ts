/**
 * Awaits an RTK Query mutation (`trigger(args).unwrap()`) and resolves to
 * whether it succeeded. A failure has already been shown to the user by the
 * feedback middleware, so callers only branch on the outcome:
 *
 *   if (await succeeded(login(values).unwrap())) router.replace(ROUTES.dashboard);
 */
export async function succeeded(promise: Promise<unknown>): Promise<boolean> {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
}

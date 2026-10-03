import { useGetMeQuery } from "@/services/api";

/** The signed-in user, derived from the cached `getMe` call (the single source of session truth). */
export function useAuth() {
  const { data, isLoading, isFetching, isError } = useGetMeQuery();
  return {
    user: data ?? null,
    isAuthenticated: Boolean(data),
    /** True only until the first answer arrives; refetches don't flip it back. */
    isLoading: isLoading || (isFetching && !data && !isError),
  };
}

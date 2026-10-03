import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";

/**
 * Single source of truth for backend communication. Feature APIs extend it with
 * `baseApi.injectEndpoints(...)` and share one cache, reducer and middleware.
 *
 * Auth is an httpOnly cookie set by the API, hence `credentials: "include"`.
 * Errors are NOT handled in components: `store/middleware/feedback.middleware`
 * turns every rejected call into a toast.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: env.apiUrl, credentials: "include" }),
  tagTypes: ["Me", "User", "Role", "RoleOption", "Permission", "PermissionTree"],
  endpoints: () => ({}),
});

/** Every API response is wrapped as `{ success, message, data }`; features only want `data`. */
export const unwrapData = <T>(response: { data: T }): T => response.data;

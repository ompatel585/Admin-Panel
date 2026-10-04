import type { ApiResponse } from "@/types/api";
import type { DashboardStats } from "@/types/dashboard";
import { baseApi, unwrapData } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStats, { tenantId?: string } | void>({
      query: (params) => ({ url: "/dashboard/stats", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<DashboardStats>) => unwrapData(r),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;

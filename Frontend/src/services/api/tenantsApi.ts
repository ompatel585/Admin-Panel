import type { ApiResponse, Paginated } from "@/types/api";
import type {
  CreateTenantRequest,
  Tenant,
  TenantListParams,
  TenantOption,
  TenantStatus,
  UpdateTenantRequest,
} from "@/types/tenant";
import { baseApi, unwrapData } from "./baseApi";

export const tenantsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTenants: build.query<Paginated<Tenant>, TenantListParams | void>({
      query: (params) => ({ url: "/tenants", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<Paginated<Tenant>>) => unwrapData(r),
      providesTags: ["Tenant"],
    }),

    /** Admin workspace picker. */
    getTenantOptions: build.query<TenantOption[], void>({
      query: () => "/tenants/options",
      transformResponse: (r: ApiResponse<TenantOption[]>) => unwrapData(r),
      providesTags: ["TenantOption"],
    }),

    /** The signed-in user's own workspace. */
    getCurrentTenant: build.query<Tenant, void>({
      query: () => "/tenants/current",
      transformResponse: (r: ApiResponse<Tenant>) => unwrapData(r),
      providesTags: ["Tenant"],
    }),

    createTenant: build.mutation<Tenant, CreateTenantRequest>({
      query: (body) => ({ url: "/tenants", method: "POST", body }),
      transformResponse: (r: ApiResponse<Tenant>) => unwrapData(r),
      invalidatesTags: ["Tenant", "TenantOption", "Dashboard"],
    }),

    updateTenant: build.mutation<Tenant, { id: string } & UpdateTenantRequest>({
      query: ({ id, ...body }) => ({ url: `/tenants/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<Tenant>) => unwrapData(r),
      invalidatesTags: ["Tenant", "TenantOption", "Me"],
    }),

    updateTenantStatus: build.mutation<Tenant, { id: string; status: TenantStatus }>({
      query: ({ id, status }) => ({ url: `/tenants/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: (r: ApiResponse<Tenant>) => unwrapData(r),
      invalidatesTags: ["Tenant"],
    }),

    deleteTenant: build.mutation<void, string>({
      query: (id) => ({ url: `/tenants/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tenant", "TenantOption", "User", "Site", "SiteOption", "CrawlJob", "Dashboard"],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantOptionsQuery,
  useGetCurrentTenantQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useUpdateTenantStatusMutation,
  useDeleteTenantMutation,
} = tenantsApi;

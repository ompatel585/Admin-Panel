import type { ApiResponse, Paginated } from "@/types/api";
import type {
  CreateSiteRequest,
  Site,
  SiteListParams,
  SiteOption,
  UpdateSiteRequest,
  UpdateWidgetRequest,
} from "@/types/site";
import { baseApi, unwrapData } from "./baseApi";

export const sitesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSites: build.query<Paginated<Site>, SiteListParams | void>({
      query: (params) => ({ url: "/sites", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<Paginated<Site>>) => unwrapData(r),
      providesTags: ["Site"],
    }),

    getSiteOptions: build.query<SiteOption[], { tenantId?: string } | void>({
      query: (params) => ({ url: "/sites/options", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<SiteOption[]>) => unwrapData(r),
      providesTags: ["SiteOption"],
    }),

    createSite: build.mutation<Site, CreateSiteRequest>({
      query: (body) => ({ url: "/sites", method: "POST", body }),
      transformResponse: (r: ApiResponse<Site>) => unwrapData(r),
      invalidatesTags: ["Site", "SiteOption", "CrawlJob", "Tenant", "Dashboard"],
    }),

    updateSite: build.mutation<Site, { id: string } & UpdateSiteRequest>({
      query: ({ id, ...body }) => ({ url: `/sites/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<Site>) => unwrapData(r),
      invalidatesTags: ["Site", "SiteOption"],
    }),

    updateSiteWidget: build.mutation<Site, { id: string } & UpdateWidgetRequest>({
      query: ({ id, ...body }) => ({ url: `/sites/${id}/widget`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<Site>) => unwrapData(r),
      invalidatesTags: ["Site"],
    }),

    crawlSite: build.mutation<Site, string>({
      query: (id) => ({ url: `/sites/${id}/crawl`, method: "POST" }),
      transformResponse: (r: ApiResponse<Site>) => unwrapData(r),
      invalidatesTags: ["Site", "CrawlJob", "Dashboard"],
    }),

    deleteSite: build.mutation<void, string>({
      query: (id) => ({ url: `/sites/${id}`, method: "DELETE" }),
      invalidatesTags: ["Site", "SiteOption", "CrawlJob", "Tenant", "Dashboard"],
    }),
  }),
});

export const {
  useGetSitesQuery,
  useGetSiteOptionsQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useUpdateSiteWidgetMutation,
  useCrawlSiteMutation,
  useDeleteSiteMutation,
} = sitesApi;

import type { ApiResponse, Paginated } from "@/types/api";
import type { CrawlJob, CrawlJobListParams } from "@/types/crawl-job";
import { baseApi, unwrapData } from "./baseApi";

export const crawlJobsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCrawlJobs: build.query<Paginated<CrawlJob>, CrawlJobListParams | void>({
      query: (params) => ({ url: "/crawl-jobs", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<Paginated<CrawlJob>>) => unwrapData(r),
      providesTags: ["CrawlJob"],
    }),

    cancelCrawlJob: build.mutation<CrawlJob, string>({
      query: (id) => ({ url: `/crawl-jobs/${id}/cancel`, method: "POST" }),
      transformResponse: (r: ApiResponse<CrawlJob>) => unwrapData(r),
      invalidatesTags: ["CrawlJob", "Site", "Dashboard"],
    }),
  }),
});

export const { useGetCrawlJobsQuery, useCancelCrawlJobMutation } = crawlJobsApi;

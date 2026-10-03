import type { ApiResponse, Paginated } from "@/types/api";
import type {
  CreatePermissionRequest,
  Permission,
  PermissionListParams,
  PermissionNode,
  UpdatePermissionRequest,
} from "@/types/permission";
import { baseApi, unwrapData } from "./baseApi";

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPermissions: build.query<Paginated<Permission>, PermissionListParams | void>({
      query: (params) => ({ url: "/permissions", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<Paginated<Permission>>) => unwrapData(r),
      providesTags: ["Permission"],
    }),

    getPermissionTree: build.query<PermissionNode[], void>({
      query: () => "/permissions/tree",
      transformResponse: (r: ApiResponse<PermissionNode[]>) => unwrapData(r),
      providesTags: ["PermissionTree"],
    }),

    createPermission: build.mutation<Permission, CreatePermissionRequest>({
      query: (body) => ({ url: "/permissions", method: "POST", body }),
      transformResponse: (r: ApiResponse<Permission>) => unwrapData(r),
      invalidatesTags: ["Permission", "PermissionTree"],
    }),

    updatePermission: build.mutation<Permission, { id: string } & UpdatePermissionRequest>({
      query: ({ id, ...body }) => ({ url: `/permissions/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<Permission>) => unwrapData(r),
      // Deactivating a permission changes what roles (and the caller) effectively hold.
      invalidatesTags: ["Permission", "PermissionTree", "Role", "Me"],
    }),

    deletePermission: build.mutation<void, string>({
      query: (id) => ({ url: `/permissions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Permission", "PermissionTree"],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetPermissionTreeQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionsApi;

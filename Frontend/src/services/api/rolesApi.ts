import type { ApiResponse, Paginated } from "@/types/api";
import type {
  CreateRoleRequest,
  Role,
  RoleListParams,
  RoleOption,
  UpdateRoleRequest,
} from "@/types/role";
import { baseApi, unwrapData } from "./baseApi";

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<Paginated<Role>, RoleListParams | void>({
      query: (params) => ({ url: "/roles", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<Paginated<Role>>) => unwrapData(r),
      providesTags: ["Role"],
    }),

    getRoleOptions: build.query<RoleOption[], void>({
      query: () => "/roles/options",
      transformResponse: (r: ApiResponse<RoleOption[]>) => unwrapData(r),
      providesTags: ["RoleOption"],
    }),

    createRole: build.mutation<Role, CreateRoleRequest>({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      transformResponse: (r: ApiResponse<Role>) => unwrapData(r),
      invalidatesTags: ["Role", "RoleOption"],
    }),

    updateRole: build.mutation<Role, { id: string } & UpdateRoleRequest>({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<Role>) => unwrapData(r),
      // Users show their role; the signed-in user's own permissions may change too.
      invalidatesTags: ["Role", "RoleOption", "User", "Me"],
    }),

    deleteRole: build.mutation<void, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["Role", "RoleOption"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleOptionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;

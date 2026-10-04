import type { ApiResponse, Paginated } from "@/types/api";
import type { CreateUserRequest, UpdateUserRequest, User, UserDetail, UserListParams } from "@/types/user";
import { baseApi, unwrapData } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<Paginated<User>, UserListParams | void>({
      query: (params) => ({ url: "/users", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<Paginated<User>>) => unwrapData(r),
      providesTags: ["User"],
    }),

    getUser: build.query<UserDetail, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (r: ApiResponse<UserDetail>) => unwrapData(r),
      providesTags: ["User"],
    }),

    createUser: build.mutation<User, CreateUserRequest>({
      query: (body) => ({ url: "/users", method: "POST", body }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User", "Tenant"],
    }),

    updateUser: build.mutation<User, { id: string } & UpdateUserRequest>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User", "Me"],
    }),

    updateUserStatus: build.mutation<User, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/users/${id}/status`, method: "PATCH", body: { isActive } }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User"],
    }),

    updateUserRole: build.mutation<User, { id: string; roleId: string; tenantId?: string }>({
      query: ({ id, ...body }) => ({ url: `/users/${id}/role`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User", "Tenant"],
    }),

    updateUserPermissions: build.mutation<UserDetail, { id: string; permissionIds: string[] }>({
      query: ({ id, permissionIds }) => ({ url: `/users/${id}/permissions`, method: "PUT", body: { permissionIds } }),
      transformResponse: (r: ApiResponse<UserDetail>) => unwrapData(r),
      // The signed-in user could be the one edited, so refresh the session too.
      invalidatesTags: ["User", "Me"],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User", "Tenant"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useUpdateUserPermissionsMutation,
  useDeleteUserMutation,
} = usersApi;

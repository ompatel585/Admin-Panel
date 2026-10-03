import type { ApiResponse, Paginated } from "@/types/api";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserListParams,
} from "@/types/user";
import { baseApi, unwrapData } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<Paginated<User>, UserListParams | void>({
      query: (params) => ({ url: "/users", params: params ?? undefined }),
      transformResponse: (r: ApiResponse<Paginated<User>>) => unwrapData(r),
      providesTags: ["User"],
    }),

    createUser: build.mutation<User, CreateUserRequest>({
      query: (body) => ({ url: "/users", method: "POST", body }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User"],
    }),

    updateUser: build.mutation<User, { id: string } & UpdateUserRequest>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User", "Me"],
    }),

    updateUserStatus: build.mutation<User, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User"],
    }),

    updateUserRole: build.mutation<User, { id: string; roleId: string }>({
      query: ({ id, roleId }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { roleId },
      }),
      transformResponse: (r: ApiResponse<User>) => unwrapData(r),
      invalidatesTags: ["User"],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = usersApi;

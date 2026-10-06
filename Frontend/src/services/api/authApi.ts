import type { ApiResponse } from "@/types/api";
import type {
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignupRequest,
  UpdateProfileRequest,
} from "@/types/auth";
import { baseApi, unwrapData } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<AuthUser, void>({
      query: () => "/auth/me",
      transformResponse: (r: ApiResponse<AuthUser>) => unwrapData(r),
      providesTags: ["Me"],
    }),

    login: build.mutation<AuthUser, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (r: ApiResponse<AuthUser>) => unwrapData(r),
      // Seed the session cache so route guards don't bounce a fresh login.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authApi.util.upsertQueryData("getMe", undefined, data));
        } catch {
          // Rejection is reported by the feedback middleware; nothing to seed.
        }
      },
    }),

    signup: build.mutation<AuthUser, SignupRequest>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
      transformResponse: (r: ApiResponse<AuthUser>) => unwrapData(r),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authApi.util.upsertQueryData("getMe", undefined, data));
        } catch {
          // Rejection is reported by the feedback middleware; nothing to seed.
        }
      },
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      // Drop every cached (permission-scoped) response from the previous session.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(baseApi.util.resetApiState());
        } catch {
          // Rejection is reported by the feedback middleware; stay signed in.
        }
      },
    }),

    forgotPassword: build.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    resetPassword: build.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),

    updateProfile: build.mutation<AuthUser, UpdateProfileRequest>({
      query: (body) => ({ url: "/auth/me", method: "PATCH", body }),
      transformResponse: (r: ApiResponse<AuthUser>) => unwrapData(r),
      // The session holds the name and email shown everywhere, so refresh it in place.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authApi.util.upsertQueryData("getMe", undefined, data));
        } catch {
          // Reported by the feedback middleware.
        }
      },
      invalidatesTags: ["User"],
    }),

    changePassword: build.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;

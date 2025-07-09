import { baseApi } from './baseApi';

export const userAuthApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    loginUser: builder.mutation({
      query: credentials => ({
        url: '/account/login/',
        method: 'POST',
        body: { ...credentials },
        credentials: 'omit',
      }),
    }),
    registerUser: builder.mutation({
      query: user => {
        return {
          url: '/account/register/',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          },
          credentials: 'omit',
        };
      },
    }),
    getLoggedUser: builder.query({
      query: () => {
        return {
          url: '/account/profile',
          method: 'GET',
        };
      },
    }),
    googleLogin: builder.mutation({
      query: token => {
        return {
          url: '/account/social/google/',
          method: 'POST',
          body: token,
        };
      },
    }),
    sendEmail: builder.query({
      query: () => {
        return {
          url: '/account/invoke_verify_email',
          method: 'GET',
        };
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetLoggedUserQuery,
  useGoogleLoginMutation,
  useLazySendEmailQuery,
} = userAuthApi;

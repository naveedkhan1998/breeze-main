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
    googleLogin: builder.query({
      query: () => {
        return {
          url: '/account/google',
          method: 'GET',
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
  useGoogleLoginQuery,
  useLazySendEmailQuery,
} = userAuthApi;

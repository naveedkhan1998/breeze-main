import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from './auth';
import { getApiBaseUrl } from '../lib/environment';

const baseUrl = getApiBaseUrl();

const baseQuery = fetchBaseQuery({
  baseUrl,
  // credentials: "include",
  prepareHeaders: headers => {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery,
  endpoints: builder => ({
    healthCheck: builder.query({
      query: () => ({
        url: '/',
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      }),
    }),
  }),
});

export const { useHealthCheckQuery } = baseApi;

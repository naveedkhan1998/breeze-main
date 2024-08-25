import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "./auth";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

//https://dtemplarsarsh.pythonanywhere.com
const baseUrl = isLocalhost ? "http://localhost:8000" : "https://breeze-backend.mnaveedk.com";

const baseQuery = fetchBaseQuery({
  baseUrl,
  // credentials: "include",
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  endpoints: (builder) => ({
    healthCheck: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
  }),
});

export const { useHealthCheckQuery } = baseApi;

import { baseApi } from "./baseApi";

export const breezeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBreeze: builder.query({
      query: () => {
        return {
          url: "core/breeze/",
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        };
      },
    }),
    createBreeze: builder.mutation({
      query: (data) => ({
        url: "core/breeze/",
        method: "POST",
        body: data,
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
    updateBreeze: builder.mutation({
      query: ({ data }) => ({
        url: "core/breeze/",
        method: "PUT",
        body: data,
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
    
  }),
});

export const { useGetBreezeQuery, useUpdateBreezeMutation, useCreateBreezeMutation} = breezeApi;

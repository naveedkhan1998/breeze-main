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
    checkBreezeStatus: builder.query({
      query: () => {
        return {
          url: "core/breeze/breeze_status",
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
        url: `core/breeze/${data.id}/`,
        method: "PUT",
        body: data,
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
    startWebsocket: builder.mutation({
      query: () => ({
        url: `core/breeze/websocket_start/`,
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useGetBreezeQuery,
  useCheckBreezeStatusQuery,
  useUpdateBreezeMutation,
  useCreateBreezeMutation,
  useStartWebsocketMutation,
} = breezeApi;

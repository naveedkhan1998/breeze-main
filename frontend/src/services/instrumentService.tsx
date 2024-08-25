import { baseApi } from "./baseApi";

export const instrumentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribedInstruments: builder.query({
      query: () => {
        return {
          url: "core/subscribed_instruments/",
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        };
      },
    }),
    getCandles: builder.query({
      query: ({ id, tf }) => {
        return {
          url: `core/get_candles/?id=${id}&tf=${tf}`,
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        };
      },
    }),
    subscribeInstrument: builder.mutation({
      query: ({ id, duration }) => ({
        url: `core/subscribe/${id}`,
        method: "POST",
        body: {
          duration: duration,
        },
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
    loadInstrumentCandles: builder.mutation({
      query: ({ id }) => ({
        url: `core/candles/${id}`,
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
    deleteInstrument: builder.mutation({
      query: ({ id }) => ({
        url: `core/delete/${id}`,
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),
    getInstruments: builder.query({
      query: ({ exchange, search }) => {
        return {
          url: `core/get_instruments/?exchange=${exchange}&search=${search}`,
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        };
      },
    }),
  }),
});

export const {
  useGetSubscribedInstrumentsQuery,
  useGetCandlesQuery,
  useLazyGetCandlesQuery,
  useGetInstrumentsQuery,
  useSubscribeInstrumentMutation,
  useLoadInstrumentCandlesMutation,
  useDeleteInstrumentMutation,
} = instrumentApi;

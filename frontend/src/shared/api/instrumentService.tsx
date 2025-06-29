import { baseApi } from './baseApi';

export const instrumentApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSubscribedInstruments: builder.query({
      query: () => {
        return {
          url: 'core/subscribed_instruments/',
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
    }),
    getCandles: builder.query({
      query: ({ id, tf }) => {
        return {
          url: `core/candles/get_candles/?id=${id}&tf=${tf}`,
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
    }),
    subscribeInstrument: builder.mutation({
      query: ({ id, duration }) => ({
        url: `core/subscribed_instruments/${id}/subscribe/`,
        method: 'POST',
        body: {
          duration: duration,
        },
        headers: {
          'Content-type': 'application/json',
        },
      }),
    }),
    loadInstrumentCandles: builder.mutation({
      query: ({ id }) => ({
        url: `core/candles/${id}`,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
      }),
    }),
    deleteInstrument: builder.mutation({
      query: ({ id }) => ({
        url: `core/subscribed_instruments/${id}/`,
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
        },
      }),
    }),
    getInstruments: builder.query({
      query: ({ exchange, search, optionType, strikePrice, expiryAfter, expiryBefore }) => {
        const params = new URLSearchParams();
        if (exchange) params.append('exchange', exchange);
        if (search) params.append('search', search);
        if (optionType) params.append('option_type', optionType);
        if (strikePrice) params.append('strike_price', strikePrice);
        if (expiryAfter) params.append('expiry_after', expiryAfter);
        if (expiryBefore) params.append('expiry_before', expiryBefore);

        return {
          url: `core/instruments/?${params.toString()}`,
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
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

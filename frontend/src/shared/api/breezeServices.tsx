import { BreezeAccount, CreateBreeze } from '@/types/common-types';
import { baseApi } from './baseApi';

export const breezeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getBreeze: builder.query<{ data: BreezeAccount[]; msg: string }, void>({
      query: () => {
        return {
          url: 'core/breeze/',
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
      providesTags: ['Breeze'],
    }),
    checkBreezeStatus: builder.query<
      { data: { session_status: boolean; websocket_status: boolean } },
      void
    >({
      query: () => {
        return {
          url: 'core/breeze/breeze_status',
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
      providesTags: ['Breeze'],
    }),
    createBreeze: builder.mutation<BreezeAccount, CreateBreeze>({
      query: data => ({
        url: 'core/breeze/',
        method: 'POST',
        body: data,
        headers: {
          'Content-type': 'application/json',
        },
      }),
      invalidatesTags: ['Breeze'],
    }),
    updateBreeze: builder.mutation<BreezeAccount, { data: BreezeAccount }>({
      query: ({ data }) => ({
        url: `core/breeze/${data.id}/`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-type': 'application/json',
        },
      }),
      invalidatesTags: ['Breeze'],
    }),
    startWebsocket: builder.mutation<void, void>({
      query: () => ({
        url: `core/breeze/websocket_start/`,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
      }),
      invalidatesTags: ['Breeze'],
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

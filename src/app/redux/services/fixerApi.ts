import { baseApi } from './baseApi';
import type { IUser } from '@/types/user';
import type { JobOffer } from '@/types/job-offer';

interface ConvertToFixerPayload {
  profile: {
    ci?: string;
    selectedServiceIds?: string[];
    vehicle?: {
      hasVehiculo: boolean;
      tipoVehiculo?: string;
    };
    paymentMethods?: Array<{ type: 'cash' | 'qr' | 'card' }>;
    terms?: { accepted: boolean };
    location?: {
      lat?: number;
      lng?: number;
      address?: string;
      departamento?: string;
      pais?: string;
    };
    phone?: string;
  };
}

interface ConvertToFixerResponse {
  message: string;
  user: IUser;
}

export const fixerApi = baseApi.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({
    getFixerById: builder.query<IUser, string>({
      query: (id) => `users/${id}`,
      providesTags: (result) => result ? [{ type: 'User', id: result._id }] : [],
    }),

    getFixers: builder.query<IUser[], void>({
      query: () => 'users/role/fixer',
      providesTags: (result) =>
        result
          ? [
            ...result.map((user) => ({ type: 'User' as const, id: user._id! })),
            { type: 'User', id: 'LIST' },
          ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getJobsByFixer: builder.query<JobOffer[], string>({
      query: (fixerId) => `jobs/fixer/${fixerId}`,
      providesTags: (result, error, fixerId) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Job' as const, id: id })),
            { type: 'Job', id: `FIXER-${fixerId}` },
          ]
          : [{ type: 'Job', id: `FIXER-${fixerId}` }],
    }),

    convertToFixer: builder.mutation<ConvertToFixerResponse, { id: string; payload: ConvertToFixerPayload }>({
      query: ({ id, payload }) => ({
        url: `/user-profiles/${id}/convert-fixer`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFixerByIdQuery,
  useGetFixersQuery,
  useGetJobsByFixerQuery,
  useConvertToFixerMutation,
} = fixerApi;

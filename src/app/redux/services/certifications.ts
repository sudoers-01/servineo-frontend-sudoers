
import { baseApi } from './baseApi';
import type { ICertification } from '@/types/fixer-profile';

// falta configurar las rutas
export const experienceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Crear certificación
    createCertification: builder.mutation<ICertification, Partial<ICertification>>({
      query: (body) => ({
        url: '/experiences',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Certification'],
    }),

    // Obtener certificaciones por fixer
    getCertificationsByFixer: builder.query<ICertification[], string>({
      query: (fixerId) => `/certifications/fixer/${fixerId}`,
      providesTags: ['Certification'],
    }),

    // Actualizar certificación
    updateCertification: builder.mutation<ICertification, { id: string; data: Partial<ICertification> }>({
      query: ({ id, data }) => ({
        url: `/certifications/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Certification'],
    }),

    // Eliminar certificación
    deleteCertification: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/certifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Certification'],
    }),
  }),
  overrideExisting: false,
});

export const {
   useGetCertificationsByFixerQuery,
   useCreateCertificationMutation,
   useUpdateCertificationMutation,
   useDeleteCertificationMutation,
   useLazyGetCertificationsByFixerQuery,
} = experienceApi;

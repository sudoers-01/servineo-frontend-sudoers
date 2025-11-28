import { baseApi } from "./baseApi"
import type { IExperience } from "@/types/fixer-profile"

export const experiencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExperiencesByFixer: builder.query<IExperience[], string>({
      query: (fixerId) => `experiences/fixer/${fixerId}`,
      providesTags: (result = []) => [
        'Experience',
        ...result.map(({ _id }) => ({ type: 'Experience' as const, id: _id }))
      ]
    }),
    createExperience: builder.mutation<IExperience, Omit<IExperience, '_id' | 'createdAt' | 'updatedAt'>>({
      query: (experience) => ({
        url: 'experiences',
        method: 'POST',
        body: experience
      }),
      invalidatesTags: ['Experience']
    }),
    updateExperience: builder.mutation<IExperience, { id: string; updates: Partial<IExperience> }>({
      query: ({ id, updates }) => ({
        url: `experiences/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Experience', id },
        'Experience'
      ]
    }),
    deleteExperience: builder.mutation<void, string>({
      query: (id) => ({
        url: `experiences/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Experience', id },
        'Experience'
      ]
    })
  }),
  overrideExisting: false,
})

export const { 
  useGetExperiencesByFixerQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation
} = experiencesApi

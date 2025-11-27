import { baseApi } from "./baseApi"
import type { IExperience } from "@/types/fixer-profile"

export const experiencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExperiencesByFixer: builder.query<IExperience[], string>({
      query: (fixerId) => `/api/experiences/fixer/${fixerId}`,
    }),
  }),
  overrideExisting: false,
})

export const { useGetExperiencesByFixerQuery } = experiencesApi

import useSWR from 'swr'
import { jsonFetcher } from '@/lib/fetcher'
import type { FixerRating } from '@/mocks/ratings'

// Hook que obtiene calificaciones y se actualiza cada 5 segundos
export function useFixerRatings(fixerId: string) {
  const { data, error, isLoading, mutate } = useSWR<FixerRating[]>(
    fixerId ? `/api/fixers/${fixerId}/ratings` : null,
    jsonFetcher,
    { refreshInterval: 5000 } // 5 segundos
  )
  return { ratings: data ?? [], error, isLoading, mutate }
}

import { DB_VALUES, JobTypeValue } from '@/app/redux/contants'

 
export function useJobTypeAutoMatch() {
  const findMatchingJobType = (searchQuery: string): JobTypeValue | null => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase().trim()

    const exactMatch = DB_VALUES.jobTypes.find(
      (jobType) => jobType.toLowerCase() === query
    )

    if (exactMatch) return exactMatch

    const partialMatch = DB_VALUES.jobTypes.find((jobType) =>
      jobType.toLowerCase().includes(query)
    )

    return partialMatch || null
  }

  return {
    findMatchingJobType,
    availableJobTypes: DB_VALUES.jobTypes,
  }
}

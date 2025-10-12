// src/lib/fetcher.ts
export async function jsonFetcher<T = unknown>(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error('Error when checking grades')
  return (await res.json()) as T
}
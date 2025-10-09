// src/lib/fetcher.ts
export async function jsonFetcher<T = unknown>(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error('Error al consultar calificaciones')
  return (await res.json()) as T
}
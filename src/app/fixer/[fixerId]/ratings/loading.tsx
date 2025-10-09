export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />
      ))}
    </div>
  )
}


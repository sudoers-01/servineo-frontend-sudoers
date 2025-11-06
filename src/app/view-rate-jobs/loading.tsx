export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="h-7 w-56 rounded-md bg-neutral-100 animate-pulse" />
        <div className="h-8 w-28 rounded-lg bg-neutral-100 animate-pulse" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-white animate-pulse">
            <div className="space-y-1">
              <div className="h-4 w-60 bg-neutral-100 rounded" />
              <div className="h-3 w-24 bg-neutral-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}  

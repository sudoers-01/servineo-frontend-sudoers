'use client';

import { useState } from 'react';
import type { RatedJob } from './utils';

export function StarRating({
  value,
  size = 30,
  srLabel,
}: { value: 0|1|2|3; size?: number; srLabel?: string }) {
  return (
    <div className="inline-flex gap-1" aria-label={srLabel ?? `${value} de 3 estrellas`}>
      {Array.from({ length: 3 }).map((_, i) => {
        const filled = i < value;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
            className={filled ? 'drop-shadow-sm' : 'opacity-60'}
          >
            <path
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              style={filled ? { fill: '#facc15' } : { fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1.5 }}
            />
          </svg>
        );
      })}
    </div>
  );
}

function Dropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="px-3 py-2 rounded-lg border bg-white shadow-sm text-sm flex items-center gap-2 border-gray-200"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Ordenar por calificación
        <svg className="w-3 h-3 ml-1 text-blue-600" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-10 mt-2 w-44 rounded-xl border bg-white shadow-md border-gray-200"
        >
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
            Descendente
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
            Ascendente
          </button>
        </div>
      )}
    </div>
  );
}

export function RatedJobsList({
  jobs,
}: { jobs: RatedJob[] }) {
  return (
    <section className="space-y-6 relative w-full">
      <div className="flex items-center justify-end">
        <Dropdown />
      </div>

      <div className="relative">
        <ul className="flex flex-col gap-4 min-h-[220px]">
          {jobs.map(job => (
            <li
              key={job.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-white border-gray-200 w-full"
            >
              <div className="min-w-0">
                <p className="font-medium truncate text-gray-800">{job.title}</p>
                <p className="text-xs text-gray-500">
                  Date: {new Date(job.dateISO).toLocaleDateString()}
                </p>
              </div>

              <StarRating value={job.rating} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition"
        >
          Go to comments
        </button>
      </div>
    </section>
  );
}

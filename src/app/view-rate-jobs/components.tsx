'use client';

import { useState } from 'react';
import type { RatedJob } from './utils';

export function StarRating({
  value,
  size = 18,
  srLabel,
}: { value: 0|1|2|3; size?: number; srLabel?: string }) {
  return (
    <div className="inline-flex gap-1" aria-label={srLabel ?? `${value} de 3 estrellas`}>
      {Array.from({ length: 3 }).map((_, i) => {
        const filled = i < value;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" role="img" aria-hidden="true"
               style={filled ? { fill: 'var(--highlight)' } : { fill: 'transparent', stroke: 'var(--highlight)' }}>
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
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
        className="px-3 py-2 rounded-lg border bg-white shadow-sm text-sm flex items-center gap-2"
        style={{ borderColor:'var(--surface-border)' }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Ordenar por calificación
        <span aria-hidden="true" style={{
          width:0, height:0, borderLeft:'6px solid transparent',
          borderRight:'6px solid transparent', borderTop:'7px solid var(--primary)'
        }}/>
      </button>

      {open && (
        <div role="menu"
             className="absolute z-10 mt-2 w-56 rounded-xl border bg-white shadow"
             style={{ borderColor:'var(--surface-border)' }}>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">
            Descendente
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">
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
    <section className="space-y-4 relative">
      <div className="flex items-center justify-end">
        <Dropdown />
      </div>

      <div className="relative">
        <ul className="flex flex-col gap-4 min-h-[220px]">
          {jobs.map(job => (
            <li key={job.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-white"
                style={{ borderColor:'var(--surface-border)', background:'var(--surface-card)' }}>
              <div className="min-w-0">
                <p className="font-medium truncate">{job.title}</p>
                <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                  Date: {new Date(job.dateISO).toLocaleDateString()}
                </p>
              </div>
              <StarRating value={job.rating} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mt-6">
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

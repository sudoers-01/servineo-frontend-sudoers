'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Roboto } from 'next/font/google';
import type { RatedJob } from './utils';
import { apiFetch } from '../../config/api'; // corrige la ruta según tu estructura

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

function StarRating({
  value,
  size = 38,
  srLabel,
}: {
  value: 0 | 1 | 2 | 3;
  size?: number;
  srLabel?: string;
}) {
  return (
    <div className='inline-flex gap-1' aria-label={srLabel ?? `${value} de 3 estrellas`}>
      {Array.from({ length: 3 }).map((_, i) => {
        const filled = i < value;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox='0 0 24 24'
            role='img'
            aria-hidden='true'
            className={filled ? 'drop-shadow-sm' : 'opacity-60'}
          >
            <path
              d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
              style={
                filled
                  ? { fill: '#facc15' } // yellow
                  : { fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1.5 }
              }
            />
          </svg>
        );
      })}
    </div>
  );
}

function GenericDropdown({
  label,
  options,
  align = 'right',
}: {
  label: string;
  options: { key: string; label: string }[];
  align?: 'right' | 'left';
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  function updateCoords() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setCoords({
      left: rect.left + window.scrollX,
      top: rect.bottom + window.scrollY,
      width: rect.width,
    });
  }

  useEffect(() => {
    if (!open) return;
    updateCoords();

    function onDocClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function toggle() {
    if (!btnRef.current) return setOpen((v) => !v);
    const rect = btnRef.current.getBoundingClientRect();
    setCoords({
      left: rect.left + window.scrollX,
      top: rect.bottom + window.scrollY,
      width: rect.width,
    });
    setOpen((v) => !v);
  }

  return (
    <>
      <div className='inline-block'>
        <button
          ref={btnRef}
          type='button'
          onClick={toggle}
          className='px-3 py-2 rounded-lg border bg-white shadow-sm text-sm flex items-center gap-2 border-gray-200'
          aria-haspopup='menu'
          aria-expanded={open}
        >
          {label}
          <svg
            className='w-3 h-3 ml-1 text-blue-600'
            viewBox='0 0 10 6'
            fill='currentColor'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden
          >
            <path d='M1 1l4 4 4-4' />
          </svg>
        </button>
      </div>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role='menu'
            style={{
              position: 'absolute',
              left: align === 'right' ? coords.left : coords.left,
              top: coords.top,
              width: coords.width,
              zIndex: 99999,
            }}
            className='rounded-xl border bg-white opacity-100 shadow-lg border-gray-200 text-gray-800 pointer-events-auto'
          >
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setOpen(false);
                }}
                className='w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-800'
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

function RatedJobsList({ jobs }: { jobs: RatedJob[] }) {
  return (
    <section className='space-y-6 relative w-full'>
      <div className='relative'>
        <ul className='flex flex-col gap-4 min-h-[220px]'>
          {jobs.map((job) => (
            <li
              key={job.id}
              className='flex items-center justify-between gap-4 p-4 rounded-xl border bg-white border-gray-200 w-full shadow-[0_6px_8px_rgba(0,0,0,0.06)]'
            >
              <div className='min-w-0'>
                <p className='font-medium truncate text-gray-800'>{job.title}</p>
                <p className='text-xs text-gray-500'>
                  Date: {new Date(job.dateISO).toLocaleDateString()}
                </p>
              </div>

              <StarRating value={job.rating ?? 0} />
            </li>
          ))}
        </ul>
      </div>

      <div className='fixed bottom-6 right-40 z-50'>
        <button
          type='button'
          className='px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition'
        >
          Go to comments
        </button>
      </div>
    </section>
  );
}

export default function RatedJobsPage() {
  const [jobs, setJobs] = useState<RatedJob[]>([]);

  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

 useEffect(() => {
  apiFetch('api/rated-jobs')
    .then((result) => setJobs(result.data || []))
    .catch((err) => console.error('Error fetching jobs:', err));
}, []);

  return (
    <main className={`min-h-screen bg-white text-gray-700 ${roboto.className}`}>
      <div className='max-w-3xl mx-auto p-6 space-y-6'>
        <header className='flex flex-col items-center'>
          <h1 className='text-2xl font-semibold tracking-tight text-center'>Rated Jobs List</h1>
          <div className='mt-3 flex items-center gap-4 w-full justify-end'>
            <div className='flex items-center mr-2'>
              {loading && (
                <div className='flex items-center gap-2'>
                  <svg
                    className='animate-spin h-5 w-5 text-blue-600'
                    viewBox='0 0 24 24'
                    aria-hidden
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      strokeWidth='4'
                      stroke='#3b82f6'
                      strokeOpacity='0.25'
                      fill='none'
                    />
                    <path
                      d='M22 12a10 10 0 0 1-10 10'
                      strokeWidth='4'
                      stroke='#3b82f6'
                      strokeLinecap='round'
                      fill='none'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Procesando...</span>
                </div>
              )}
            </div>

            <GenericDropdown
              label='Ordenar por calificación'
              options={[
                { key: 'descending', label: 'Descendente' },
                { key: 'ascending', label: 'Ascendente' },
              ]}
            />

            <GenericDropdown
              label='Filtrar por fecha'
              options={[
                { key: 'recent', label: 'Mas reciente' },
                { key: 'oldest', label: 'Mas antiguo' },
              ]}
            />
          </div>
        </header>

        <RatedJobsList jobs={jobs} />
      </div>
    </main>
  );
}

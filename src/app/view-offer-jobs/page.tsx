'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockOfferJobs, RatedOfferJob, fallbackImage } from './utils';
import { Pencil, Trash2 } from 'lucide-react';

function OfferStateBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border absolute bottom-3 right-3
      ${
        active
          ? 'bg-green-50 text-green-600 border-green-200'
          : 'bg-red-50 text-red-600 border-red-200'
      }`}
    >
      {active ? 'Activa' : 'Inactiva'}
    </span>
  );
}

export default function ViewOfferJobsPage() {
  const [offers] = useState<RatedOfferJob[]>(mockOfferJobs);

  const [filter, setFilter] = useState<'active' | 'inactive'>('active');

  const filteredOffers =
    filter === 'active' ? offers.filter((o) => o.isActive) : offers.filter((o) => !o.isActive);

  return (
    <main className='min-h-screen bg-white text-gray-700 font-roboto'>
      <div className='max-w-6xl mx-auto p-6 space-y-6'>
        <Link href='/' className='text-sm text-blue-600 hover:underline'>
          ← Volver al inicio
        </Link>

        <header className='flex justify-between items-center bg-white z-10'>
          <div>
            <h1 className='text-2xl font-semibold'>Mis Ofertas de Trabajo</h1>
            <p className='text-xs text-gray-500'>Fixer Mock · +591 70341618</p>
          </div>

          <div className='flex items-center gap-4'>
            <select
              value='__placeholder__'
              onChange={(e) => {
                const v = e.target.value as 'active' | 'inactive';
                setFilter(v);
              }}
              aria-label='Filtrar por estado'
              className='border rounded-lg px-3 py-2 text-sm shadow border-gray-200'
            >
              <option value='__placeholder__' disabled hidden>
                Filtrar por estado
              </option>

              <option value='active'>Activas</option>
              <option value='inactive'>Inactivas</option>
            </select>

            <button className='px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium shadow hover:bg-blue-700 transition'>
              + Nueva Oferta
            </button>
          </div>
        </header>

        <div className='h-[70vh] overflow-auto'>
          <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredOffers.map((offer) => (
              <article
                key={offer.id}
                className='border rounded-2xl shadow p-4 relative bg-white hover:-translate-y-1 transition'
              >
                <img
                  src={offer.image || fallbackImage}
                  alt={offer.title}
                  className='w-full h-40 object-cover rounded-xl'
                />

                <div className='absolute top-3 right-3 flex gap-2'>
                  <button className='p-2 rounded-full bg-white shadow border border-gray-200'>
                    <Pencil size={18} className='text-gray-600' />
                  </button>
                  <button className='p-2 rounded-full bg-white shadow border border-gray-200'>
                    <Trash2 size={18} className='text-red-600' />
                  </button>
                </div>

                <div className='mt-3 space-y-1'>
                  <p className='font-medium text-gray-800 truncate'>{offer.title}</p>
                  <p className='text-xs text-gray-500'>
                    {offer.city} · {new Date(offer.dateISO).toLocaleDateString()}
                  </p>
                </div>

                <OfferStateBadge active={offer.isActive} />
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

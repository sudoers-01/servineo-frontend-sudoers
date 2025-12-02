'use client';

import { useState } from 'react';
import ActivateOfferModal from '@/app/components/fixers/ActivateOfferModal';

export default function RequestersLanding() {
  const [modalOpen, setModalOpen] = useState(false);

  const offerId = "68eedc4ddf120f15a959ace8";

  return (
    <main className='min-h-screen bg-white flex items-center justify-center'>
      <div className='text-center space-y-8'>
        <h1 className='text-3xl sm:text-4xl font-semibold text-gray-900'>Requesters</h1>

        <div className='flex items-center justify-center gap-4'>
          <button
            onClick={() => setModalOpen(true)}
            className='px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition'
          >
            Offer Confirmation Modal
          </button>
        </div>
      </div>

      <ActivateOfferModal
        offerId={offerId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(offerUpdated) => {
          console.log("Oferta activada:", offerUpdated);
        }}
      />
    </main>
  );
}

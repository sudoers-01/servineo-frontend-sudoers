'use client';

import { useState } from 'react';
import ActivateOfferModal from '@/app/components/fixers/ActivateOfferModal';

export default function RequestersLanding() {
  const offerId = "68eedc4ddf120f15a959ace8"; 
  const [isActive, setIsActive] = useState(true);
  const [open, setOpen] = useState(false);

  const handleConfirm = async (newStatus: boolean, offerId: string) => {
    console.log("Actualizando oferta:", offerId, " -> ", newStatus ? "active" : "inactive");

    await fetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: newStatus ? "active" : "inactive" })
    });

    setIsActive(newStatus);
    setOpen(false);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-semibold">Requesters</h1>

        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {isActive ? "Desactivar oferta" : "Activar oferta"}
        </button>
      </div>

      <ActivateOfferModal
        open={open}
        isActive={isActive}
        offerId={offerId}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </main>
  );
}

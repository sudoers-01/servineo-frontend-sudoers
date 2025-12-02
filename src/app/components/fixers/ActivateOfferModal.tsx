'use client';
import React from 'react';

interface Props {
  open: boolean;
  isActive: boolean;
  offerId: string;
  onConfirm: (newStatus: boolean, offerId: string) => void;
  onClose: () => void;
}

export default function ActivateOfferModal({ open, isActive, offerId, onConfirm, onClose }: Props) {
  if (!open) return null;

  const nextStatus = !isActive;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-80">
        <h2 className="text-black font-semibold mb-4">
          {nextStatus ? 'Activar oferta' : 'Desactivar oferta'}
        </h2>

        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que quieres {nextStatus ? 'activar' : 'desactivar'} esta oferta?
        </p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-black hover:bg-gray-300"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className={`px-4 py-2 rounded-lg text-white ${
              nextStatus ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={() => onConfirm(nextStatus, offerId)}
          >
            {nextStatus ? 'Activar' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}

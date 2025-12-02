import React, { useState } from 'react';

type OfferSummary = {
  _id?: string;
  title?: string;
  state?: string;
  [key: string]: any;
};

interface ActivateOfferModalProps {
  offerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (offer: OfferSummary) => void;
}

export default function ActivateOfferModal({ offerId, isOpen, onClose, onSuccess }: ActivateOfferModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch(`/api/offers/${encodeURIComponent(offerId)}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await resp.json();

      if (!resp.ok) {
        const message = data?.error || data?.message || 'Error desconocido';
        setError(typeof message === 'string' ? message : JSON.stringify(message));
        setLoading(false);
        return;
      }

      if (onSuccess) onSuccess(data.offer);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('ActivateOfferModal error:', err);
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={() => {
          if (!loading) {
            setError(null);
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activate-offer-title"
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg"
      >
        <h3 id="activate-offer-title" className="mb-2 text-lg font-semibold">
          Confirmar activar oferta
        </h3>

        <p className="mb-4 text-sm text-gray-700">
          ¿Estás seguro que deseas <strong>activar</strong> esta oferta? (ID: <code>{offerId}</code>)
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (!loading) {
                setError(null);
                onClose();
              }
            }}
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? (
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            ) : null}
            {loading ? 'Activando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

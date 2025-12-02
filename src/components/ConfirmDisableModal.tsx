'use client';

import { useState } from 'react';

interface Props {
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDisableModal({ open, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-50'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
    >
      <div className='bg-white rounded-xl p-7 w-[350px] shadow-xl'>
        <h2 className='text-center text-gray-800 text-lg font-semibold mb-4'>
          Seguro que quieres desactivar el trabajo
        </h2>

        <div className='flex justify-between mt-6'>
          <button
            className='bg-blue-600 text-white rounded-lg px-5 py-2 text-sm hover:bg-blue-700'
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Desactivando...' : 'Aceptar'}
          </button>

          <button
            className='bg-gray-300 text-black rounded-lg px-5 py-2 text-sm hover:bg-gray-400'
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

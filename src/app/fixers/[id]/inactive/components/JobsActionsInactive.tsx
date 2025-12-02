'use client';

import { useState } from 'react';
import ConfirmActivateModal from '@/components/ConfirmActivateModal';
import { activateJobMock } from '@/services/activateJobMock';

export default function JobsActionsInactive() {
  const [open, setOpen] = useState(false);

  const handleActivate = async () => {
    await activateJobMock();
    setOpen(false);
    console.log('Trabajo activado (mock)');
  };

  return (
    <div className='flex justify-end mb-4'>
      {/* BOTÓN ACTIVAR TRABAJO */}
      <button
        onClick={() => setOpen(true)}
        className='bg-gray-200 px-4 py-2 rounded-lg text-black border shadow-sm hover:bg-gray-300'
      >
        Activar trabajo
      </button>

      <ConfirmActivateModal
        open={open}
        onConfirm={handleActivate}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

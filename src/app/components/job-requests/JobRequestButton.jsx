'use client';

import { useState } from 'react';
import JobRequestModal from './JobRequestModal';

export default function JobRequestButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSubmit = (formData) => {
    console.log('Datos del formulario recibidos en el botón:', formData);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='bg-[#2BDDE0] hover:bg-[#5E2BE0] text-white font-medium py-2 px-4 rounded-md transition'
      >
        Crear Solicitud de Trabajo
      </button>

      <JobRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}

'use client';
import { useState } from 'react';
import JobRequestModal from './JobRequestModal';
import { CreateJobRequestPayload } from '@/types/job-request';

export default function JobRequestPage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSubmit = (formData: CreateJobRequestPayload) => {
    console.log('Datos del formulario recibidos:', formData);
    setIsOpen(false);
  };

  return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <div className='text-center space-y-8'>
        <h1 className='text-3xl sm:text-4xl font-semibold text-gray-900'>Solicitar Servicio</h1>

        <button
          onClick={() => setIsOpen(true)}
          className='bg-[#2BDDE0] hover:bg-[#5E2BE0] text-white font-medium py-3 px-6 rounded-md transition text-lg'
        >
          Crear Solicitud de Trabajo
        </button>

        <JobRequestModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
}

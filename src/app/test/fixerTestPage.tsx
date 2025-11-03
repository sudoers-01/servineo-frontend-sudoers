"use client";

import { WeekAvailabilityModal, WeekAvailabilityModalHandles } from '@/components/appointments/forms/WeekAvailabilityModal';
import { DaySelectionModal, DaySelectionModalHandles } from '@/components/appointments/forms/DaySelectionModal';
import { DayAvailabilityModal, DayAvailabilityModalHandles } from '../../components/appointments/forms/DayAvailabilityModal';
import { useRef } from 'react';

export const TestPage = () => {
  const weekModalRef = useRef<WeekAvailabilityModalHandles>(null);
  const dayModalRef = useRef<DaySelectionModalHandles>(null);

  return (
    <div className="p-4 space-y-4">
      <div className="space-x-2">
        <button 
          onClick={() => weekModalRef.current?.open()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Abrir Modal Semanal
        </button>
        
        <button 
          onClick={() => dayModalRef.current?.open()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Abrir Modal de Días
        </button>
      </div>
      
      <WeekAvailabilityModal ref={weekModalRef} />
      <DaySelectionModal ref={dayModalRef} />
    </div>
  );
};

export default TestPage;
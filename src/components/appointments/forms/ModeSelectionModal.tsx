import { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { AvailabilityHeader } from './modules/AvailabilityHeader'
import { ModeSelectionActions } from './modules/ModeSelectionActions'
import { WeekAvailabilityModal, WeekAvailabilityModalHandles } from './WeekAvailabilityModal';
import { DaySelectionModal, DaySelectionModalHandles } from './DaySelectionModal';

export interface ModeSelectionModalHandles {
  open: () => void;
  close: () => void;
}

export const ModeSelectionModal = forwardRef<ModeSelectionModalHandles>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const weekModalRef = useRef<WeekAvailabilityModalHandles>(null);
    const dayModalRef = useRef<DaySelectionModalHandles>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
      },
      close: () => handleClose()
    }), []);

    const handleClose = () => {
      setIsOpen(false);
    }

    const handleOpenWeek = () => {
      setIsOpen(false);
      weekModalRef.current?.open();
    }

    const handleOpenDaySelection = () => {
      setIsOpen(false);
      dayModalRef.current?.open();
    }

    return(
      <>
        <div className={`fixed inset-0  flex items-center justify-center p-4 z-50 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <div className={`max-w-md w-full bg-white rounded-lg shadow-lg p-6 ${
            isOpen ? 'scale-100' : 'scale-95'
          }`}>
            <AvailabilityHeader
              headerText='Seleccionar Disponibilidad'
              onClose={handleClose}
            />

            <p className="text-black font-semibold mb-4">Selecciona el modo de configuración</p>

            <ModeSelectionActions
              openWeek={handleOpenWeek}
              openDaySelection={handleOpenDaySelection}
            />
          </div>
        </div>

        <WeekAvailabilityModal ref={weekModalRef} />
        <DaySelectionModal ref={dayModalRef} />
      </>
    )
  }
);

ModeSelectionModal.displayName = 'ModeSelectionModal';

export default ModeSelectionModal;
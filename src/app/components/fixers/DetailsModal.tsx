import { ModalComponent } from '@/shared/ui/ModalComponent';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const DetailsModal = ({ isOpen, onClose, onAccept }: ReviewModalProps) => {
  return (
    <ModalComponent isOpen={isOpen} onClose={onClose} Accept={onAccept}>
      <div className='flex flex-col gap-4 w-[500px] max-w-[90%] text-left'>
        <div className='flex justify-between items-start'>
          <div>
            <h2 className='text-lg font-semibold text-gray-800'>Reparación eléctrica</h2>
            <p className='text-sm text-gray-400'>Date: 29/10/2025</p>
          </div>
          <div className='flex gap-1'>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className='text-yellow-400 text-xl'>
                ★
              </span>
            ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className='text-gray-300 text-xl'>
                ★
              </span>
            ))}
          </div>
        </div>

        <div className='text-sm text-gray-700 leading-relaxed'>
          <p className='font-semibold mb-1'>Descripción</p>
          <p>
            Instalación y reparación de un tomacorriente en mal estado. Se reemplazó el enchufe
            dañado y se aseguró el correcto funcionamiento del circuito.
          </p>
        </div>

        <div className='text-sm text-gray-700'>
          <p className='font-semibold mb-1'>Tipo de servicio:</p>
          <p>Eléctrico y mantenimiento</p>
        </div>

        <div className='text-sm text-gray-700'>
          <p className='font-semibold mb-1'>Comentario:</p>
          <p>
            El técnico llegó un poco tarde y, aunque logró reparar el tomacorriente, el trabajo no
            quedó del todo prolijo. Los cables estaban algo sueltos y tuve que reajustar la tapa al
            día siguiente. Aprecio que haya venido, pero esperaba un mejor acabado por el precio.
          </p>
        </div>
      </div>
    </ModalComponent>
  );
};

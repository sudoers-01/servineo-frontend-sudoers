import Modal from './../../profile/[id]/modal-window';

type RegisterJobModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

//TODO: Mejorar la ecuacion, o comprar la API de GoogleMaps xd
const kilometers = 1;
const distance = 3.53 * kilometers;
const center = -0.0792 * kilometers ** 3 + 0.8576 * kilometers ** 2 - 4.0616 * kilometers + 7.2885;

export default function RegisterJobModal({ isOpen, onClose }: RegisterJobModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='w-[40rem] h-[30rem] bg-white py-4 border-2 rounded-2xl border-gray-900 text-black'>
        <div className='overflow-y-auto h-[27rem] font-sans px-8'>
          <h2 className='text-2xl font-bold text-center mb-4'>Registro</h2>

          <div className='mb-4'>
            <p className='text-sm font-semibold mb-1'>Detalles:</p>
            <p className='text-sm'>Usuario: Fulanito de Tal</p>
          </div>

          <div className='mb-4'>
            <p className='text-sm font-semibold mb-1'>Descripción:</p>
            <p className='text-sm'>Tuberia de cocina con fuga...</p>
          </div>

          <div className='mb-4'>
            <p className='text-sm font-semibold'>Fecha: 01/01/2025</p>
          </div>

          <div className='mb-4'>
            <p className='text-sm font-semibold mb-2'>Ubicacion:</p>
            <div className='w-full h-48 bg-blue-50 rounded-2xl border-2 border-gray-900 overflow-hidden relative flex justify-center'>
              <div
                style={{
                  width: `${distance}rem`,
                  height: `${distance}rem`,
                  transform: `translateY(${center}rem)`,
                }}
                className='absolute border border-black rounded-full bg-transparent flex justify-center items-center pointer-events-none z-10'
              ></div>
              <iframe
                src='https://www.google.com/maps?q=-17.39133523734603,-66.25352236491746&z=13&output=embed'
                width='100%'
                height='100%'
                style={{ border: 0, pointerEvents: 'auto' }}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className='mb-6'>
            <p className='text-sm font-semibold'>Estado: En progreso</p>
          </div>

          <div className='flex justify-end gap-3'>
            <button
              onClick={onClose}
              className='px-5 py-2 text-sm font-medium bg-white border border-gray-900 rounded-md hover:bg-gray-50 transition-colors'
            >
              Cerrar
            </button>
            <button
              onClick={onClose}
              className='px-5 py-2 text-sm font-medium bg-white border border-gray-900 rounded-md hover:bg-gray-50 transition-colors'
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

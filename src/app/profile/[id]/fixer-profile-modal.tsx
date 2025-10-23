import React from 'react';
import Modal from './modal-window';
import { useProfile } from './hooks/useProfile';
import { useRouter } from 'next/navigation';

type FixerProfileProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

export default function FixerProfile({ isOpen, onClose, userId }: FixerProfileProps) {
  const { data, errors } = useProfile(userId);
  const router = useRouter();

  //
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {data ? (
        <div className='w-[20rem] md:w-[40rem] md:min-w-[30rem] mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200 text-black'>
          <h2 className='text-lg font-semibold uppercase tracking-wide mb-4'>Perfil del Fixer</h2>
          <div className='md:flex md:flex-row-reverse justify-between w-full'>
            <div className='flex flex-col items-center'>
              {!data ? (
                <div className='w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-user-icon lucide-user'
                  >
                    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                </div>
              ) : (
                <img
                  src={data.photo_url}
                  alt={data.name}
                  className='w-24 h-24 rounded-full object-cover'
                />
              )}
              <div className='flex gap-2 mb-4'>
                {[1, 2, 3].map((star) => (
                  <svg
                    key={star}
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-star-icon lucide-star w-6 h-6'
                  >
                    <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                  </svg>
                ))}
              </div>

              <button
                className='px-4 py-2 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                onClick={() => router.push(`/fixer-ratings-details/68e87a9cdae3b73d8040102f`)}
              >
                VER DETALLES DE CALIFICACIONES
              </button>
            </div>
            <div className='mb-3 md:mr-5 md:w-[60%] mt-3'>
              <div className='flex items-baseline gap-2'>
                <span className='md:text-sm font-medium text-xs'>Nombre:</span>
                <span className='md:text-base font-semibold text-sm'>{data?.name}</span>
              </div>
              <div className='flex items-baseline gap-2'>
                <span className='md:text-sm font-medium text-xs'>Rol:</span>
                <span className='md:text-base font-semibold text-sm'>{data?.role}</span>
              </div>

              <div className='flex flex-col justify-center items-center md:block mt-4'>
                <h3 className='text-sm font-semibold mb-1'>
                  {`CALIFICACIONES `} {data && <span>({data?.rating_count})</span>}
                </h3>

                <div className='flex items-center gap-1 mb-4'>
                  {[1, 2, 3].map((star) =>
                    data?.average_rating && data.average_rating >= star ? (
                      <svg
                        key={star}
                        xmlns='http://www.w3.org/2000/svg'
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-star-icon lucide-star w-5 h-5 fill-amber-400 text-amber-400'
                      >
                        <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                      </svg>
                    ) : (
                      <svg
                        key={star}
                        xmlns='http://www.w3.org/2000/svg'
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-star-icon lucide-star w-5 h-5'
                      >
                        <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                      </svg>
                    ),
                  )}
                </div>
              </div>

              <div className='space-y-3'>
                {[3, 2, 1].map((rating) => (
                  <div key={rating} className='flex items-center gap-3'>
                    <span className='text-xs w-20'>
                      {rating} {rating === 1 ? 'ESTRELLA' : 'ESTRELLAS'}
                    </span>
                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                      {data ? (
                        <div
                          className='h-full bg-black rounded-full transition-all duration-300'
                          style={{
                            width: `${(data?.ratings?.[rating as 1 | 2 | 3] / data?.rating_count) * 100}%`,
                          }}
                        />
                      ) : (
                        <div
                          className='h-full bg-black rounded-full transition-all duration-300'
                          style={{ width: `0%` }}
                        />
                      )}
                    </div>
                    <span className='text-xs font-medium w-8'>
                      {(data?.ratings?.[rating as 1 | 2 | 3] / data?.rating_count) * 100}%
                    </span>
                  </div>
                ))}
              </div>

              <div className='mt-4 pt-1'>
                <p className='text-xs '>
                  PROMEDIO DE CALIFICACIONES
                  {data && (
                    <span className='font-bold '>{` ${Number(data?.average_rating).toFixed(1)}`}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className='md:flex md:justify-end'>
            <button
              onClick={() => {
                onClose();
              }}
              className='w-full md:w-32 py-3 px-6 cursor-pointer bg-black text-white font-medium rounded-lg hover:bg-black/90 transition-colors'
            >
              Aceptar
            </button>
          </div>
        </div>
      ) : errors ? (
        <div className='flex items-center justify-center'>
          <div className='bg-white border  rounded-xl p-8 max-w-sm shadow-sm'>
            <h2 className='text-xl font-semibold text-red-600 mb-2'>Error</h2>
            <p className='text-gray-700 mb-6'>{errors}</p>
            <button
              onClick={() => onClose()}
              className='cursor-pointer w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition'
            >
              OK
            </button>
          </div>
        </div>
      ) : (
        <div>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='35'
            height='35'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-loader-circle-icon lucide-loader-circle animate-spin '
          >
            <path d='M21 12a9 9 0 1 1-6.219-8.56' />
          </svg>
        </div>
      )}
    </Modal>
  );
}

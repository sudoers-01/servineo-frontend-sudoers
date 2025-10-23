'use client';
import { useParams } from 'next/navigation';
import FixerProfile from './fixer-profile-modal';
import { useState } from 'react';

export default function ProfilePage() {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const handleShowProfile = () => {
    setIsOpen(true);
  };
  const closeShowProfile = () => {
    setIsOpen(false);
  };
  return (
    <>
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <button
          onClick={handleShowProfile}
          className='px-4 py-2 text-sm font-medium text-black border border-black bg-white rounded-lg hover:bg-slate-100 cursor-pointer  transition-colors'
        >
          Ver perfil
        </button>
      </div>
      {isOpen && <FixerProfile isOpen={isOpen} onClose={closeShowProfile} userId={id as string} />}
    </>
  );
}

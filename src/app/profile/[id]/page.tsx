'use client';
import { useParams } from 'next/navigation';
import FixerProfile from './fixer-profile';

export default function ProfilePage() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow">ID de usuario no proporcionado.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">          
        <h1 className="text-xl font-semibold text-gray-800">Servineo</h1>
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <FixerProfile userId={id as string} />
        </div>
      </main>
    </div>
  );
}

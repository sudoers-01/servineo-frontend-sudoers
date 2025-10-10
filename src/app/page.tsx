// app/page.tsx - REEMPLAZA todo el contenido con:
import Link from 'next/link';


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Servineo</h1>
        <p className="text-gray-600 mb-8">Sistema de Booking</p>
        
        <div className="space-y-4">
          <Link 
            href="/calendar" 
            className="block bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg font-medium transition-colors"
          >
            📅 Ver Calendario
          </Link>
          
          <Link 
            href="/appointments" 
            className="block bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-medium transition-colors"
          >
            📋 Ver Citas
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Search, Calendar, MapPin, Hammer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/app/Home/lib/api';
import Link from "next/link";

export default function Home() {
  const [status, setStatus] = useState<string>('⏳ Conectando con el backend...');

  useEffect(() => {
    const fetchHealth = async () => {
      const res: ApiResponse<any> = await api.get('/api/health');
      if (res.success) {
        setStatus(`✅ Backend activo: ${JSON.stringify(res.data)}`);
      } else {
        setStatus(`❌ Error al conectar: ${res.error}`);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div
      className={`font-sans flex flex-col min-h-screen text-white`}
      style={{
        background: 'linear-gradient(135deg, #2B31E0 0%, #1AA7ED 50%, #5E2BE0 100%)',
      }}
    >
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 bg-white/10 backdrop-blur-md shadow-sm border-b border-white/20">
        <h1 className="text-2xl font-bold tracking-wide">SERVINEO</h1>
        <Link
          href="/Home/login"
          className="relative inline-block px-5 py-2.5 font-semibold text-white rounded-lg 
          bg-gradient-to-r from-servineo-200 via-servineo-300 to-servineo-500 
          shadow-lg overflow-hidden transition-all duration-300 
          hover:scale-105 hover:shadow-servineo-400/40"
        >
      <span className="relative z-10">Iniciar sesión</span>
      <span className="absolute inset-0 bg-gradient-to-r from-servineo-500 to-servineo-300 opacity-0 hover:opacity-100 transition-all duration-300 rounded-lg"></span>
</Link>
      </header>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-10 drop-shadow-md">
          ¿Qué servicio necesitas hoy?
        </h2>
        <p className="text-white/80 mb-10 max-w-xl">
          Encuentra carpinteros, fontaneros, electricistas y más en tu comunidad.
        </p>

        {/* Search Bar funcional */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 w-full max-w-3xl shadow-lg">
          <div className="flex items-center ">
            <Hammer className="text-white" />
            <input
              type="text"
              placeholder="Servicio (ej: carpintero)"
              className="flex-1 bg-transparent outline-none placeholder-white text-white"
            />
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="text-center py-6 text-white/80 text-sm border-t border-white/20 bg-white/10 backdrop-blur-md">
        © 2025 Servineo — Conecta con los mejores profesionales de tu comunidad.
      </footer>
    </div>
  );
}

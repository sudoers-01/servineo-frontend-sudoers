'use client';

import { Search, Calendar, MapPin, Hammer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/app/Control_C/lib/api';
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-servineo-500 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Servineo</h1>
        <nav className="hidden md:flex gap-6">
          <a href="#" className="hover:text-servineo-200">Inicio</a>
          <a href="#" className="hover:text-servineo-200">Servicios</a>
          <a href="#" className="hover:text-servineo-200">Proveedores</a>

          <a href="#" className="hover:text-servineo-200">Ayuda</a>
        </nav>
        <Link
          href="/Control_C/login"
          className="bg-servineo-200 px-4 py-2 rounded-lg text-white font-semibold hover:bg-servineo-300 transition"
        >
        Iniciar sesión
        </Link>
      </header>
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-600 text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          ¿Qué servicio necesitas hoy?
        </h2>
        <p className="text-lg mb-8">
          Encuentra carpinteros, fontaneros, electricistas y más en tu comunidad.
        </p>

        {}
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4 p-6 w-full max-w-3xl">
          <div className="flex items-center gap-2 w-full md:w-1/3 border border-gray-200 rounded-lg px-3 py-2">
            <Hammer className="text-servineo-500" />
            <input
              type="text"
              placeholder="Servicio (ej: carpintero)"
              className="flex-1 outline-none text-black"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-1/3 border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="text-servineo-500" />
            <input
              type="date"
              className="flex-1 outline-none text-black"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-1/3 border border-gray-200 rounded-lg px-3 py-2">
            <MapPin className="text-servineo-500" />
            <input
              type="text"
              placeholder="Ubicación"
              className="flex-1 outline-none text-black"
            />
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-servineo-300 text-white py-16 px-6 text-center">
        <h3 className="text-3xl font-bold mb-4">
          Agenda fácil, rápida y confiable.
        </h3>
        <p className="max-w-2xl mx-auto mb-8">
          Consulta la disponibilidad en tiempo real de los expertos y agenda cuando mejor te convenga.
        </p>
        <button className="bg-servineo-600 hover:bg-servineo-500 text-white px-6 py-3 rounded-lg font-medium transition">
          Cómo funciona
        </button>

        <div className="flex justify-center gap-12 mt-10 text-sm">
          <div className="flex flex-col items-center">
            <Search size={28} className="mb-2" />
            <span>Rapidez</span>
          </div>
          <div className="flex flex-col items-center">
            <Hammer size={28} className="mb-2" />
            <span>Confianza</span>
          </div>
          <div className="flex flex-col items-center">
            <Calendar size={28} className="mb-2" />
            <span>Agenda Online</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-servineo-500 text-white text-center py-6 mt-auto">
        © 2025 Servineo — Conecta con los mejores profesionales de tu comunidad.
      </footer>
    </div>
  );
}

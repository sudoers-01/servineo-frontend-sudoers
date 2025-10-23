'use client';

import { Search, Calendar, MapPin, Hammer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from 'next/link';
import UserMenu from "./controlC/HU3/components/UI/menuUsuario";
import { useAuth } from "./controlC/HU3/hooks/usoAutentificacion";

export default function HomePage() {
  const { user } = useAuth();
  useEffect(() => {
  const registro = sessionStorage.getItem("toastMessage");
  if (registro) {
    toast.success(registro); 
    setTimeout(() => sessionStorage.removeItem("toastMessage"), 100);
  }
}, [user]);


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
        <div>
          {user ? (
            <UserMenu />
          ) : (
            <Link
              href="./controlC/HU4/login"
              className="px-6 py-3 text-lg text-white bg-[#2B31E0] rounded-lg font-medium hover:bg-[#1AA7ED] transition"
            >
              Registrarse
            </Link>
          )}
        </div>
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
      <ToastContainer position="bottom-right" autoClose={4000} />
    </div>
  );
}
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../HU3/hooks/usoAutentificacion';
import UserMenu from '../HU3/components/UI/menuUsuario';
import AccountLoginSettings from '../HU7/registrarVinculo/page'; // <-- tu componente de cuentas

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarCuentas, setMostrarCuentas] = useState(false); 
  

  type SafeUser = { name?: string; email?: string; url_photo?: string };
  const safeUser = (user as SafeUser) ?? null;

  function getInitials(name: string) {
    const clean = (name || '').trim();
    if (!clean) return 'U';
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  return (
    <div className="font-sans flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 shadow-sm border-b border-white/20 text-white"
        style={{ background: 'linear-gradient(135deg, #2B31E0 0%, #1AA7ED 50%, #5E2BE0 100%)' }}>
        <h1 className="text-2xl font-bold tracking-wide">SERVINEO</h1>
        {safeUser && (
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
              {safeUser.url_photo ? (
                <img src={safeUser.url_photo} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/20 text-white font-semibold">
                  {getInitials(safeUser.name ?? safeUser.email ?? '')}
                </div>
              )}
            </button>
            <span className="hidden sm:inline-block font-medium text-white/95 select-none">
              {safeUser.name ?? safeUser.email}
            </span>
            <UserMenu open={menuOpen} onToggle={() => setMenuOpen((s) => !s)} />
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 flex flex-col justify-between relative shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <button onClick={() => router.back()} className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                Configuración
              </h2>
            </div>

            {/* Menú lateral */}
            <nav className="space-y-2">
              <Link href="/controlC/HU5" className="block">
                <button
                  className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all duration-300 ease-out ${
                    !mostrarCuentas && pathname === '/controlC/HU5'
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'hover:bg-blue-50 hover:text-blue-600 hover:font-semibold'
                  }`}
                >
                  <img src="/icons/edit-config.png" alt="Editar Perfil" className="w-6 h-6" />
                  Editar Perfil
                </button>
              </Link>

              <Link href="/controlC/Configuracion/Seguridad" className="block">
                <button
                  className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all duration-300 ease-out ${
                    !mostrarCuentas && pathname === '/controlC/Configuracion/Seguridad'
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'hover:bg-blue-50 hover:text-blue-600 hover:font-semibold'
                  }`}
                >
                  <img src="/icons/seguridad-config.png" alt="Seguridad" className="w-7 h-7" />
                  Seguridad
                </button>
              </Link>

              {/* ✅ Botón Cuentas Vinculadas */}
              <button
                onClick={() => setMostrarCuentas(true)}
                className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all duration-300 ease-out ${
                  mostrarCuentas ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:bg-blue-50 hover:text-blue-600 hover:font-semibold'
                }`}
              >
                <img src="/icons/cuentas.png" alt="Cuentas" className="w-7 h-7" />
                Cuentas vinculadas
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido derecho */}
        <main className="flex-1 flex flex-col items-center text-center p-8 relative">
          {mostrarCuentas ? (
            <AccountLoginSettings token={localStorage.getItem("servineo_token") ?? ""} />
          ) : (
            <div className="flex flex-col items-center justify-top flex-1 mt-10">
              {safeUser ? (
                <>
                  <div className="mb-4">
                    {safeUser.url_photo ? (
                      <img src={safeUser.url_photo} alt="Foto de perfil" className="w-28 h-28 rounded-full border-4 border-blue-100 object-cover mb-4 shadow-sm"/>
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-700 mb-4 shadow-sm border-4 border-blue-200">
                        {getInitials(safeUser.name ?? safeUser.email ?? '')}
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                    Te damos la bienvenida, <span className="text-blue-600">{safeUser.name ?? 'Usuario'}</span>
                  </h2>
                  <p className="text-gray-600 max-w-md">
                    Gestiona tu información, privacidad y seguridad para mejorar tu experiencia en <strong>Servineo</strong>.
                  </p>
                </>
              ) : (
                <p className="text-gray-600">Inicia sesión para ver tus configuraciones.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

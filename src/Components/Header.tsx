'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Hammer } from 'lucide-react';
import UserMenu from './menuUsuario';
import { useAuth } from '../userManagement/hooks/usoAutentificacion'; // <- ruta RELATIVA dentro de src/app

export default function Header({
  title = 'SERVINEO',
  loginHref = '/userManagement/requester/signIn',
}: {
  title?: string;
  loginHref?: string;
}) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  type SafeUser = { name?: string; email?: string; url_photo?: string };
  const safeUser = user as SafeUser | null;

  function getInitials(name: string) {
    const clean = (name || '').trim();
    if (!clean) return 'U';
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  return (
    <header className="flex justify-between items-center px-8 md:px-10 py-6 bg-white/10 backdrop-blur-md shadow-sm border-b border-white/20">
      <h1 className="text-2xl font-bold tracking-wide">{title}</h1>

      <div>
        {safeUser ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 focus:outline-none cursor-pointer"
              aria-expanded={menuOpen}
              aria-label="Abrir menú de usuario"
              title={safeUser.name ?? safeUser.email}
            >
              {safeUser.url_photo ? (
                <img
                  src={safeUser.url_photo}
                  alt={safeUser.name ?? safeUser.email ?? 'Usuario'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold text-white"
                  aria-hidden
                >
                  {getInitials(safeUser.name ?? safeUser.email ?? '')}
                </div>
              )}
            </button>

            <span className="hidden sm:inline-block font-medium text-white/95 select-none">
              {safeUser.name ?? safeUser.email}
            </span>

            <UserMenu open={menuOpen} onToggle={() => setMenuOpen((s) => !s)} />
          </div>
        ) : (
          <Link
            href={loginHref}
            className="px-6 py-3 text-lg text-white bg-[#2B31E0] rounded-lg font-medium hover:bg-[#1AA7ED] transition cursor-pointer"
          >
            Registrarse
          </Link>
        )}
      </div>
    </header>
  );
}

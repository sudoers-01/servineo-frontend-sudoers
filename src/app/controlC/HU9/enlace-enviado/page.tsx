// src/app/controlC/HU9/enlace-enviado/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const visible = Math.max(1, Math.ceil(user.length * 0.25));
  return user.slice(0, visible) + '*'.repeat(Math.max(3, user.length - visible)) + '@' + domain;
}

export default function EnlaceEnviadoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get('email') || '';
  const [countdown, setCountdown] = useState(300); // 5 minutos en segundos

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const minutos = Math.floor(countdown / 60);
  const segundos = countdown % 60;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-servineo-100">
        <h1 className="text-2xl font-semibold text-servineo-500 mb-2">Enlace enviado</h1>
        <p className="text-sm text-gray-600 mb-6">
          Se envió un enlace al correo <span className="font-medium">{maskEmail(email)}</span> para que pueda ingresar sin contraseña.
        </p>

        <div className="mb-4">
          <p className="text-sm text-gray-500">Tiempo restante para usar el enlace:</p>
          <p className="text-lg font-semibold mt-1">{String(minutos).padStart(2,'0')}:{String(segundos).padStart(2,'0')}</p>
        </div>

        <button
          onClick={() => router.push('/controlC/HU4/login')}
          className="w-full bg-servineo-400 hover:bg-servineo-500 text-white font-semibold rounded-xl p-3.5 transition"
        >
          Volver a inicio de sesión
        </button>
      </div>
    </main>
  );
}

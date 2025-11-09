// src/app/controlC/HU9/verify/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const BASE_API =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/controlC';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params?.get('token') || '';
  const [msg, setMsg] = useState('Verificando enlace de acceso...');

  useEffect(() => {
    if (!token) {
      setMsg('Token no proporcionado.');
      return;
    }

    const verifyLink = async () => {
      try {
        const res = await fetch(
          `${BASE_API}/auth/magic-login?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();

        if (res.ok && data.success && data.token) {
          localStorage.setItem('servineo_token', data.token);
          localStorage.setItem('servineo_user', JSON.stringify(data.user));
          // Recarga completa para hidratar el header ya logueado
          window.location.replace('/');
        } else if (res.status === 410) {
          setMsg('El enlace ha expirado. Serás redirigido a la pantalla de recuperación.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
        } else if (res.status === 400) {
          setMsg('El enlace ya fue utilizado.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
        } else {
          setMsg(data.message || 'Error verificando enlace. Intenta nuevamente.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
        }
      } catch (err) {
        console.error('Error al verificar enlace:', err);
        setMsg('Error de conexión con el servidor.');
        setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
      }
    };

    verifyLink();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm">
        <h1 className="text-xl font-semibold text-servineo-500 mb-4">
          Verificación
        </h1>
        <p role="status" aria-live="polite" className="text-gray-700">{msg}</p>
      </div>
    </main>
  );
}

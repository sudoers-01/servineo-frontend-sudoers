'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/controlC";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params?.get('token') || '';
  const [msg, setMsg] = useState('Verificando enlace de acceso...');

  useEffect(() => {
    if (!token) {
      setMsg('Token no proporcionado.');
      return;
    }

    const verifyLink = async () => {
      try {
        const res = await fetch(`${BASE_API}/auth/magic-login?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.success && data.token) {
          // 🔹 Guardar token y datos del usuario
          localStorage.setItem('servineo_token', data.token);
          localStorage.setItem('servineo_user', JSON.stringify(data.user));

          // 🔹 Si tu backend usa cookies para sesión:
          // document.cookie = `servineo_token=${data.token}; path=/;`;

          // 🔹 Redirigir a home como logueado
          router.replace('/');
        } else if (res.status === 410) {
          setMsg('El enlace ha expirado. Solicita uno nuevo.');
          setTimeout(() => router.replace('/controlC/HU9'), 2500);
        } else if (res.status === 400) {
          setMsg('El enlace ya fue utilizado.');
          setTimeout(() => router.replace('/controlC/HU9'), 2500);
        } else {
          setMsg(data.message || 'Error verificando enlace');
          setTimeout(() => router.replace('/controlC/HU9'), 2500);
        }
      } catch (err) {
        console.error('Error al verificar enlace:', err);
        setMsg('Error de conexión con el servidor.');
        setTimeout(() => router.replace('/controlC/HU9'), 2500);
      }
    };

    verifyLink();
  }, [token, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm">
        <h1 className="text-xl font-semibold text-servineo-500 mb-4">Verificación</h1>
        <p className="text-gray-700">{msg}</p>
      </div>
    </main>
  );
}

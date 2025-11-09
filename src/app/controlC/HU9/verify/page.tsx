'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import http from '../../HU4/lib/http'; // 👈 usa el cliente http centralizado

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
        const { data } = await http.get('/auth/magic-login', { params: { token } });

        if (data.success && data.token) {
          localStorage.setItem('servineo_token', data.token);
          localStorage.setItem('servineo_user', JSON.stringify(data.user));
          window.location.replace('/');
        } else {
          setMsg(data.message || 'Error verificando enlace. Intenta nuevamente.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 410) {
          setMsg('El enlace ha expirado. Serás redirigido a la pantalla de recuperación.');
        } else if (status === 400) {
          setMsg('El enlace ya fue utilizado.');
        } else {
          setMsg(err?.response?.data?.message || 'Error de conexión con el servidor.');
        }
        setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
      }
    };

    verifyLink();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm">
        <h1 className="text-xl font-semibold text-servineo-500 mb-4">Verificación</h1>
        <p role="status" aria-live="polite" className="text-gray-700">
          {msg}
        </p>
      </div>
    </main>
  );
}

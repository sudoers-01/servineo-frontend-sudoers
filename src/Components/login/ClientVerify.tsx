'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';

// 🔹 Esquema Zod para validar la respuesta del backend
const verifyResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  user: z
    .object({
      id: z.number().or(z.string()), // depende cómo venga del backend
      email: z.string().email(),
      name: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}/api/controlC`;

export default function ClientVerify({ token }: { token?: string }) {
  const [msg, setMsg] = useState('Verificando enlace de acceso...');

  useEffect(() => {
    if (!token) {
      setMsg('Token no proporcionado.');
      return;
    }

    let cancelled = false;

    const verifyLink = async () => {
      try {
        const res = await fetch(
          `${BASE_API}/auth/magic-login?token=${encodeURIComponent(token)}`
        );

        const data = await res.json();

        // ✅ Validación con Zod
        const parsed = verifyResponseSchema.safeParse(data);

        if (cancelled) return;

        if (!parsed.success) {
          console.error('Respuesta inválida del backend:', parsed.error);
          setMsg('Error inesperado. Intenta nuevamente.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
          return;
        }

        const { success, token: userToken, user, message } = parsed.data;

        if (res.ok && success && userToken) {
          localStorage.setItem('servineo_token', userToken);
          if (user) localStorage.setItem('servineo_user', JSON.stringify(user));
          window.location.replace('/');
        } else if (res.status === 410) {
          setMsg('El enlace ha expirado. Serás redirigido a la pantalla de recuperación.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
        } else if (res.status === 400) {
          setMsg('El enlace ya fue utilizado.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
        } else {
          setMsg(message || 'Error verificando enlace. Intenta nuevamente.');
          setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
        }
      } catch (err) {
        console.error('Error al verificar enlace:', err);
        setMsg('Error de conexión con el servidor.');
        setTimeout(() => window.location.replace('/controlC/HU9'), 2500);
      }
    };

    verifyLink();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <p role="status" aria-live="polite" className="text-gray-700">
      {msg}
    </p>
  );
}

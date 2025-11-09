// src/app/controlC/HU9/enlace-enviado/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const BASE_API =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/controlC';

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  if (user.length <= 2) return user[0] + '***@' + domain;
  return user.slice(0, 2) + '*****@' + domain;
}

export default function EnlaceEnviadoPage() {
  const router = useRouter();
  const q = useSearchParams();

  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState(300); // 5 minutos
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);

  // Obtener correo sin exponerlo en URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('servineo_last_email');
      if (saved) {
        setEmail(saved);
        return;
      }
    }
    // compat: si viene por query (versiones anteriores)
    const fromQuery = q?.get('email') || '';
    if (fromQuery) setEmail(fromQuery);
  }, [q]);

  // contador
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // rate-limit en cliente (1/min) usando localStorage de forma segura
  useEffect(() => {
    if (!email || typeof window === 'undefined') return;
    const localKey = `servineo_last_request_${email}`;
    const last = localStorage.getItem(localKey);
    if (!last) return setCanResend(true);
    const diff = Date.now() - Number(last);
    setCanResend(diff >= 60_000);
  }, [email, info, countdown]);

  const minutos = Math.floor(countdown / 60);
  const segundos = countdown % 60;

  const handleResend = async () => {
    setInfo(null);
    if (!email) {
      setInfo('No se encontró el correo. Vuelve a la pantalla anterior.');
      return;
    }
    if (!canResend) {
      setInfo('Ya existe una solicitud en curso. Intenta nuevamente en 1 minuto.');
      return;
    }

    setLoading(true);
    const fallback = setTimeout(() => setInfo('Estamos tardando más de lo normal…'), 3000);

    try {
      const res = await fetch(`${BASE_API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`servineo_last_request_${email}`, String(Date.now()));
        }
        setInfo('Enlace reenviado. Revisa tu bandeja de entrada.');
        setCountdown(300);        // reinicia contador para el nuevo enlace
        setCanResend(false);      // bloquea 1 minuto
      } else if (res.status === 429) {
        setInfo('Ya existe una solicitud en curso. Intenta nuevamente en 1 minuto.');
        setCanResend(false);
      } else if (res.status === 404) {
        setInfo('El correo no está asociado a ninguna cuenta.');
      } else {
        setInfo(data.message || 'No se pudo reenviar el enlace.');
      }
    } catch {
      setInfo('Error de conexión con el servidor.');
    } finally {
      clearTimeout(fallback);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-0 overflow-hidden border border-servineo-100">
        {/* Header bonito */}
        <div className="bg-gradient-to-r from-servineo-500 to-servineo-300 p-6">
          <div className="flex items-center gap-3 text-white">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 ring-1 ring-white/30">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <div>
              <h1 className="text-xl font-semibold leading-6">¡Enlace enviado!</h1>
              <p className="text-white/90 text-sm">
                {email
                  ? <>Revisa <span className="font-medium">{maskEmail(email)}</span> para continuar.</>
                  : 'Revisa tu correo registrado para continuar.'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <p className="text-sm text-gray-700">
            Te enviamos un enlace para ingresar sin contraseña. Por seguridad, el enlace caduca en
            <span className="font-medium"> 5 minutos</span>.
          </p>

          {/* Contador visible */}
          <div className="mt-5 flex flex-col items-center gap-2" aria-live="polite">
            <p className="text-sm text-gray-700">Tiempo restante para usar el enlace:</p>
            <div
              className="
                px-6 py-2 rounded-full
                bg-gray-100 ring-1 ring-gray-300
                text-3xl font-semibold text-gray-900
                tracking-widest tabular-nums
                shadow-sm
              "
              title="Tiempo restante"
            >
              {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
            </div>
          </div>

          {/* Mensaje/alerta */}
          {info && (
            <div role="status" aria-live="polite" className="mt-4 rounded-xl bg-servineo-100/5 border border-servineo-300/40 text-gray-800 p-3 text-sm">
              {info}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleResend}
              disabled={loading || !canResend || !email}
              className={`rounded-xl p-3.5 font-semibold transition shadow
                ${
                  loading || !canResend || !email
                    ? 'bg-servineo-200 text-white cursor-not-allowed'
                    : 'bg-servineo-500 hover:bg-servineo-600 text-white'
                }`}
            >
              {loading ? 'Reenviando…' : 'Reenviar enlace'}
            </button>

            <button
              onClick={() => router.push('/controlC/HU4/login')}
              className="rounded-xl p-3.5 font-semibold transition shadow bg-white text-servineo-500 hover:text-servineo-600 ring-1 ring-servineo-300 hover:ring-servineo-400"
            >
              Volver a inicio de sesión
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 text-xs text-gray-600 space-y-1">
            <p>• Revisa la carpeta de <span className="font-medium">Spam</span> o <span className="font-medium">Promociones</span> si no ves el correo.</p>
            <p>• Al generar un nuevo enlace, los anteriores quedan <span className="font-medium">inválidos</span>.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

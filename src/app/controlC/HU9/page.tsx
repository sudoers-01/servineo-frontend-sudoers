// src/app/controlC/HU9/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RecuperacionCorreoPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const router = useRouter();

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // validación básica UI-only
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido.');
      return;
    }

    // Por ahora solo mock: navegamos a la pantalla de "enlace enviado" pasando el email por query
    // (la integración real con backend vendrá después)
    router.push(`/controlC/HU9/enlace-enviado?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-servineo-100">
        <h1 className="text-2xl font-semibold text-servineo-500 mb-2">Recuperación de acceso</h1>
        <p className="text-sm text-gray-600 mb-6">
          Te enviaremos un correo electrónico con instrucciones para ingresar a tu cuenta.
        </p>

        <form onSubmit={handleEnviar} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-servineo-400 transition"
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-servineo-500 to-servineo-300 hover:from-servineo-400 hover:to-servineo-200 text-white font-semibold rounded-xl p-3.5 mt-2 transition-all duration-300 shadow-md"
          >
            Enviar correo electrónico
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/controlC/HU4/login" className="text-servineo-400 hover:text-servineo-500 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

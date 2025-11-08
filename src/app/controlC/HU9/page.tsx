'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/controlC";

export default function RecuperacionCorreoPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (error) {
      const id = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(id);
    }
  }, [error]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) { setError("El correo no puede estar vacío"); return; }
    if (!emailValid) { setError("Correo inválido"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/controlC/HU9/enlace-enviado?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.message || "Error al solicitar el enlace");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
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
            disabled={!emailValid || loading}
            className={`w-full font-semibold rounded-xl p-3.5 mt-2 transition-all duration-300 shadow-md
              ${(!emailValid || loading)
                ? 'bg-servineo-200 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-servineo-500 to-servineo-300 hover:from-servineo-400 hover:to-servineo-200 text-white'
              }`}
          >
            {loading ? "Enviando..." : "Enviar correo electrónico"}
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

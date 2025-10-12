'use client';
import { useState } from 'react';
import { api, ApiResponse } from '@/app/Control_C/lib/api';
import { Eye, EyeOff } from 'lucide-react'; // para el icono de mostrar/ocultar password

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    try {
      const res: ApiResponse<any> = await api.post('/api/auth/login', { email, password });
      if (res.success) {
        setMensaje(`✅ ${res.data.message}`);
      } else {
        setMensaje(`❌ ${res.data?.message || res.error}`);
      }
    } catch (err: any) {
      setMensaje(`❌ Error: ${err?.message ?? 'Algo salió mal'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-600 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-servineo-500">
          Ingresa a <span className="text-servineo-600">Servineo modo requester</span>
        </h1>

        <form onSubmit={manejarLogin} className="flex flex-col gap-5 mt-8">
          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="Ingrese correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-servineo-400"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPass ? 'text' : 'password'}
                placeholder="Ingrese contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-black pr-10 focus:outline-none focus:ring-2 focus:ring-servineo-400"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-servineo-500"
              >
                {mostrarPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Botón ingresar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-servineo-500 hover:bg-servineo-400 text-white font-semibold rounded-lg p-3 transition disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">o</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Botón Google */}
        <button className="w-full flex items-center justify-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition">
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          <span className="text-sm font-medium text-gray-600">
            Continuar con Google
          </span>
        </button>

        {/* Mensaje de error o éxito */}
        {mensaje && (
          <p
            className={`mt-4 text-center text-sm ${
              mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mensaje}
          </p>
        )}

        {/* Registro */}
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <a href="#" className="text-servineo-500 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}

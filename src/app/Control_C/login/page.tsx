'use client';
import { useState } from 'react';
import { api, ApiResponse } from '@/app/Control_C/lib/api';
import { Eye, EyeOff } from 'lucide-react';
import LoginGoogle from "@/app/Control_C/components/auth/LoginGoogle";

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
    <main className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-10 border border-servineo-100">
        
        <h1 className="text-3xl font-bold text-center text-servineo-500 mb-2">
          Iniciar sesión <span className="text-servineo-400">Servineo</span>
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">Modo requester</p>

        <form onSubmit={manejarLogin} className="flex flex-col gap-5">
          {/* Correo */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Correo electrónico*
            </label>
            <input
              type="email"
              placeholder="Ingrese su correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3.5 text-gray-800 
                focus:outline-none focus:ring-2 focus:ring-servineo-400 
                focus:border-servineo-300 transition"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Contraseña*
            </label>
            <div className="relative">
              <input
                type={mostrarPass ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3.5 pr-10 
                  text-gray-800 focus:outline-none focus:ring-2 
                  focus:ring-servineo-400 transition"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute inset-y-0 right-3 flex items-center 
                  text-gray-400 hover:text-servineo-400 transition"
              >
                {mostrarPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Botón ingresar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-servineo-500 to-servineo-300 
              hover:from-servineo-400 hover:to-servineo-200 text-white 
              font-semibold rounded-xl p-3.5 mt-2 transition-all 
              duration-300 shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">o</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Botón Google */}
        <div className="mt-4">
          <LoginGoogle onMensajeChange={setMensaje} />
        </div>

        {/* Mensaje */}
        {mensaje && (
          <p
            className={`mt-6 text-center text-sm font-medium ${
              mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mensaje}
          </p>
        )}

        {/* Registro */}
        <p className="mt-8 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <a href="#" className="text-servineo-400 hover:text-servineo-500 font-medium hover:underline transition">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}

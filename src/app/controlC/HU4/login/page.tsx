'use client';
import { useState } from 'react';
import { api, ApiResponse } from '../lib/api';
import { Eye, EyeOff } from 'lucide-react';
import LoginGoogle from "../components/auth/LoginGoogle";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../HU3/hooks/usoAutentificacion';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: ApiResponse<any> = await api.post('/auth/login', { email, password });

      if (res.success && res.data) {
        const data = res.data;

        localStorage.setItem("servineo_token", data.token);
        localStorage.setItem("servineo_user", JSON.stringify(data.user));
        setUser(data.user);

        // Guardamos mensaje de éxito en sessionStorage para Home
        const mensajeExito = data.message || `¡Cuenta Creada Exitosamente! Bienvenido, ${data.user.name}!`;
        sessionStorage.setItem("toastMessage", mensajeExito);

        router.push('/');

      } else {
        const mensajeError =
          res.message ||
          res.data?.message ||
          res.error ||
          'Credenciales inválidas o error en el servidor.';

        toast.error(mensajeError, {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }

    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      toast.error(`Error: ${err?.message ?? 'No se pudo conectar con el servidor.'}`, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
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

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500"></div>
              <Link
                href="/controlC/HU9"
                className="text-servineo-400 hover:text-servineo-500 font-medium hover:underline transition text-sm"
              >
                ¿Olvidaste tu contraseña?
              </Link>
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
          <LoginGoogle
            onMensajeChange={(msg, tipo) =>
              tipo === 'error'
                ? toast.error(msg, { position: 'top-center', theme: 'colored' })
                : null // éxito ya se guarda en sessionStorage
            }
          />
        </div>

        {/* Registro */}
        <p className="mt-8 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => router.push('../HU3/FormularioRegistro')}
            className="text-servineo-400 hover:text-servineo-500 font-medium hover:underline transition"
          >
            Regístrate
          </button>
        </p>
      </div>

      {/* Contenedor Toastify */}
      <ToastContainer />
    </main>
  );
}

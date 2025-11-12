'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, ApiResponse } from '../redux/services/loginApi';
import { Eye, EyeOff } from 'lucide-react';
import LoginGoogle from "../../Components/login/LoginGoogle";
import { useRouter } from 'next/navigation';
//import { useAuth } from '../../hooks/usoAutentificacion';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from 'next/link';

// ✅ Esquema de validación Zod
const loginSchema = z.object({
  email: z.string().email("Debe ingresar un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  //const { setUser } = useAuth();

  // ✅ React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ✅ Lógica del login
  const manejarLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res: ApiResponse<any> = await api.post('/auth/login', data);

      if (res.success && res.data) {
        const datos = res.data;
        localStorage.setItem("servineo_token", datos.token);
        localStorage.setItem("servineo_user", JSON.stringify(datos.user));
        //setUser(datos.user);

        const mensajeExito = datos.message || `¡Cuenta creada exitosamente! Bienvenido, ${datos.user.name}!`;
        sessionStorage.setItem("toastMessage", mensajeExito);

        router.push('/');
      } else {
        const mensajeError =
          res.message || res.data?.message || res.error || 'Credenciales inválidas o error en el servidor.';
        toast.error(mensajeError, { position: "top-center", autoClose: 3000, theme: "colored" });
      }
    } catch (err: any) {
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
    <main className="relative min-h-screen flex items-center justify-center px-6 text-foreground">
      {/* Fondo ultra sutil */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDIwdjIwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')]" />
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-sm bg-card/95 backdrop-blur-sm rounded-3xl shadow-lg p-10 border border-border/70">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary/80 to-primary/60 bg-clip-text text-transparent">
          Iniciar sesión <span className="sr-only">Servineo</span>
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-8">Modo requester</p>

        {/* ✅ Reemplazamos el form por handleSubmit de React Hook Form */}
        <form onSubmit={handleSubmit(manejarLogin)} className="flex flex-col gap-5">
          {/* Correo */}
          <div>
            <label className="block text-sm font-semibold text-foreground/80 mb-2">
              Correo electrónico*
            </label>
            <input
              type="email"
              placeholder="Ingrese su correo"
              {...register('email')}
              className="w-full rounded-xl p-3.5 text-foreground bg-background border border-border
                         focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-foreground/80 mb-2">
              Contraseña*
            </label>
            <div className="relative">
              <input
                type={mostrarPass ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                {...register('password')}
                className="w-full rounded-xl p-3.5 pr-10 text-foreground bg-background border border-border
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary/80 transition"
                aria-label={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Enlace auxiliar */}
          <div className="flex justify-end items-center">
            <Link
              href="/userManagement/requester/signIn/forgotpass"
              className="text-primary/90 hover:text-primary underline-offset-2 hover:underline text-sm font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón ingresar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl p-3.5 mt-2 font-semibold text-primary-foreground
                       bg-primary/90 hover:bg-primary transition-all duration-300
                       shadow-sm hover:shadow disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-border/70" />
          <span className="px-2 text-muted-foreground text-sm">o</span>
          <div className="flex-1 h-px bg-border/70" />
        </div>

        {/* Botón Google */}
        <div className="mt-4">
          <LoginGoogle
            onMensajeChange={(msg, tipo) =>
              tipo === 'error'
                ? toast.error(msg, { position: 'top-center', theme: 'colored' })
                : null
            }
          />
        </div>

        {/* Registro */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => router.push('../requester/signUp')}
            className="text-primary/90 hover:text-primary font-medium underline-offset-2 hover:underline"
          >
            Regístrate
          </button>
        </p>
      </div>

      {/* Toasts */}
      <ToastContainer />
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { enviarRegistroManual } from "../service/conecionbackend";
import { generarContrasena } from "../decoder/generadorContrasena";

export default function RegistroForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarTooltip, setMostrarTooltip] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const contrasenasCoinciden = password === confirmarPassword;
  const longitudValida = password.length >= 8;
  const emailValido = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const camposLlenos =
    nombre && apellido && email && password && confirmarPassword;
  const formularioValido =
    camposLlenos && contrasenasCoinciden && longitudValida && emailValido;

  const handleGenerarContrasena = () => {
    const nueva = generarContrasena({
      length: 12,
      symbols: true,
      avoidAmbiguous: true,
    });
    setPassword(nueva);
    setConfirmarPassword(nueva);
    setMostrarTooltip(false);
    setMostrarPassword(true);
    navigator.clipboard.writeText(nueva);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje("");
    if (!formularioValido) return;

    setCargando(true);
    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;

    try {
      const data = await enviarRegistroManual(nombreCompleto, email, password);
      if (data.success) {
        setMensaje("Registro exitoso");
        if (data.token) localStorage.setItem("servineo_token", data.token);
        sessionStorage.setItem("toastMessage", `¡Cuenta Creada Exitosamente! ¡Bienvenido, ${nombreCompleto}!`);
        router.push("../HU1/FotoPerfil");
      } else {
        setMensaje(` ${data.message || "Error al registrar el usuario."}`);
      }
    } catch {
      setMensaje(" Ocurrió un error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Nombre y Apellido */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Nombre*
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              const key = e.key;
              if (
                !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key) &&
                !["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight"].includes(key)
              )
                e.preventDefault();
            }}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-servineo-400 transition"
            placeholder="Ingresa tu nombre"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Apellido*
          </label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            onKeyDown={(e) => {
              const key = e.key;
              if (
                !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key) &&
                !["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight"].includes(key)
              )
                e.preventDefault();
            }}
            className="w-full border border-gray-300 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-servineo-400 transition"
            placeholder="Ingresa tu apellido"
            required
          />
        </div>
      </div>

      {/* Correo */}
      <div className="relative">
  <label className="block text-sm font-semibold text-gray-600 mb-2">
    Correo electrónico*
  </label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="nombre@gmail.com"
    className={`w-full border rounded-xl p-2.5 text-gray-800 focus:outline-none focus:ring-2 transition ${
      email && !emailValido
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-servineo-400"
    }`}
    required
  />

  {/* Tooltip de error flotante */}
  {email && !emailValido && (
    <div className="absolute top-full left-0 mt-1 bg-red-50 border border-red-400 text-red-600 text-xs px-3 py-2 rounded-lg shadow-md animate-fade-in z-10">
      Solo se permiten correos @gmail.com
    </div>
  )}
</div>


      {/* Contraseña */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          Contraseña*
        </label>
        <div className="relative">
          <input
            type={mostrarPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => !password && setMostrarTooltip(true)}
            onBlur={() => setTimeout(() => setMostrarTooltip(false), 200)}
            placeholder="Crea una contraseña segura"
            className={`w-full border rounded-xl p-2.5 pr-10 text-gray-800 focus:outline-none focus:ring-2 transition ${
              password && (!longitudValida || !contrasenasCoinciden)
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-servineo-400"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-servineo-400 transition"
          >
            {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {mostrarTooltip && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-700 w-[260px] animate-fade-in z-10">
            <p className="mb-2">
              ¿Quieres usar una contraseña segura generada?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMostrarTooltip(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleGenerarContrasena}
                className="text-xs bg-servineo-500 text-white px-2 py-1 rounded-md hover:bg-servineo-400"
              >
                Sí, generar
              </button>
            </div>
          </div>
        )}

        {password && !longitudValida && (
          <p className="text-sm text-red-500 mt-1">
            La contraseña debe tener al menos 8 caracteres.
          </p>
        )}
      </div>

      {/* Confirmar contraseña */}
{/* Confirmar contraseña */}
<div className="relative">
  <label className="block text-sm font-semibold text-gray-600 mb-2">
    Confirmar contraseña*
  </label>
  <div className="relative">
    <input
      type={mostrarConfirmarPassword ? "text" : "password"}
      value={confirmarPassword}
      onChange={(e) => setConfirmarPassword(e.target.value)}
      placeholder="Repite tu contraseña"
      className={`w-full border rounded-xl p-2.5 pr-10 text-gray-800 focus:outline-none focus:ring-2 transition ${
        confirmarPassword && !contrasenasCoinciden
          ? "border-red-500 focus:ring-red-400"
          : "border-gray-300 focus:ring-servineo-400"
      }`}
      required
    />
    <button
      type="button"
      onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-servineo-400 transition"
    >
      {mostrarConfirmarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>

    {/* Tooltip de error flotante */}
    {confirmarPassword && !contrasenasCoinciden && (
      <div className="absolute top-full left-0 mt-1 bg-red-50 border border-red-400 text-red-600 text-xs px-3 py-2 rounded-lg shadow-md animate-fade-in z-10">
        Las contraseñas no coinciden.
      </div>
    )}
  </div>
</div>


      {/* Mensaje */}
      {mensaje && (
        <p
          className={`text-center text-sm font-medium mt-3 ${
            mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={!formularioValido || cargando}
        className="w-full bg-gradient-to-r from-servineo-500 to-servineo-300 hover:from-servineo-400 hover:to-servineo-200 text-white font-semibold rounded-xl p-2.5 mt-2 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60"
      >
        {cargando ? "Registrando..." : "Únete"}
      </button>
 
    </form>
  );
}

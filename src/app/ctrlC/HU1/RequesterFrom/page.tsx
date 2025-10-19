"use client";

import Link from "next/link";
import { useState } from "react";
import { enviarRegistroManual } from "../service/conecionbackend"; // 👈 importa tu función

export default function RegistroForm() {
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [errorRegistro, setErrorRegistro] = useState("");
  const [cargando, setCargando] = useState(false);

  // Validaciones
  const contrasenasCoinciden = password === confirmarPassword;
  const longitudValida = password.length >= 8;
  const camposLlenos = nombre && apellido && email && password && confirmarPassword;
  const emailValido = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const formularioValido =
    camposLlenos && contrasenasCoinciden && longitudValida && emailValido;

  // Envío de datos al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRegistro("");

    if (!formularioValido) return;

    setCargando(true);
    const nombreCompleto = `${nombre} ${apellido}`;

    try {
      const data = await enviarRegistroManual(nombreCompleto, email, password);

      if (data.success) {
        alert("✅ Registro exitoso");
        if (data.token) localStorage.setItem("servineo_token", data.token);
      } else {
        setErrorRegistro(data.message || "Error al registrar el usuario.");
      }
    } catch (error: any) {
      setErrorRegistro(error.message || "Ocurrió un error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FFF8E7]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px] text-center border border-gray-200">
        <h2 className="text-2xl font-bold text-[#5E2BE0] mb-1">Regístrate</h2>
        <p className="text-[#5E2BE0] mb-6">a Servineo</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Nombre y Apellido */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <label className="block text-[#2BDDE0] font-semibold mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onKeyDown={(e) => {
                  const key = e.key;
                  if (
                    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key) &&
                    !["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight"].includes(key)
                  ) e.preventDefault();
                }}
                className="w-full border rounded-md p-2 text-black border-gray-300 focus:border-[#2BDDE0] focus:outline-none"
                placeholder="Ingresa tu nombre"
              />
            </div>
            <div className="flex-1 relative">
              <label className="block text-[#2BDDE0] font-semibold mb-1">Apellido *</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                onKeyDown={(e) => {
                  const key = e.key;
                  if (
                    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key) &&
                    !["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight"].includes(key)
                  ) e.preventDefault();
                }}
                className="w-full border rounded-md p-2 text-black border-gray-300 focus:border-[#5E2BE0] focus:outline-none"
                placeholder="Ingresa tu apellido"
              />
            </div>
          </div>

          {/* Correo electrónico */}
          <div className="relative w-full">
            <label className="block text-[#2BDDE0] font-semibold mb-1">Correo electrónico *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-md p-2 text-black focus:outline-none ${
                email && !emailValido
                  ? "border-red-500"
                  : "border-gray-300 focus:border-[#2BDDE0]"
              }`}
              placeholder="nombre@gmail.com"
            />
            {email && !emailValido && (
              <p className="absolute text-sm text-red-500 mt-1 left-0">
                Solo se permiten correos "ejemplo@gmail.com"
              </p>
            )}
          </div>

          {/* Contraseñas */}
          <div className="flex gap-3">
            <div className="w-1/2 relative">
              <label className="block text-[#2BDDE0] font-semibold mb-1">Creación de Contraseña *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-md p-2 text-black focus:outline-none ${
                  password && (!longitudValida || !contrasenasCoinciden)
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#2BDDE0]"
                }`}
              />
              {password && !longitudValida && (
                <p className="absolute text-sm text-red-500 mt-1 left-0">
                  La contraseña debe tener al menos 8 caracteres.
                </p>
              )}
            </div>

            <div className="w-1/2 relative">
              <label className="block text-[#2BDDE0] font-semibold mb-1">Confirmar Contraseña *</label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className={`w-full border rounded-md p-2 text-black focus:outline-none ${
                  confirmarPassword && !contrasenasCoinciden
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#2BDDE0]"
                }`}
              />
              {confirmarPassword && !contrasenasCoinciden && (
                <p className="absolute text-sm text-red-500 mt-1 left-0">
                  Las contraseñas no coinciden.
                </p>
              )}
            </div>
          </div>

          {errorRegistro && (
            <p className="text-sm text-red-500 font-semibold">{errorRegistro}</p>
          )}
          

          <button
            type="submit"
            disabled={!formularioValido || cargando}
            className={`w-full py-2 rounded-md font-semibold text-white transition-colors mt-3 ${
              formularioValido && !cargando
                ? "bg-[#5E2BE0] hover:bg-[#4b22b8]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {cargando ? "Registrando..." : "Únete"}
          </button>
        </form>

        <div className="my-4 flex items-center justify-center">
          <hr className="w-1/4 border-gray-300" />
          <span className="mx-2 text-gray-500">o</span>
          <hr className="w-1/4 border-gray-300" />
        </div>

        <div className="flex items-center mt-4 text-sm text-gray-600">
          <input type="checkbox" className="mr-2" />
          <p>
            Al registrarte aceptas los{" "}
            <Link
              href="/ctrlC/RequesterFrom/Terminosycondiciones"
              className="underline cursor-pointer text-[#2BDDE0]"
            >
              términos de uso
            </Link>{" "}
            de Servineo.
          </p>
        </div>
      </div>
    </div>
  );
}

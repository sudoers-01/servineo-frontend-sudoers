"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export default function RegistroForm() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const contrasenasCoinciden = password === confirmarPassword;
  const longitudValida = password.length >= 8;

  const camposLlenos =
    nombre && apellido && email && password && confirmarPassword;
  const formularioValido = camposLlenos && contrasenasCoinciden && longitudValida;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido) return;
    alert("Registro exitoso");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FFF8E7]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px] text-center border border-gray-200">
        <h2 className="text-2xl font-bold text-[#5E2BE0] mb-1">Regístrate</h2>
        <p className="text-[#5E2BE0] mb-6">a Servineo</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Nombre y Apellido */}
<div className="flex gap-3">
  {/* Nombre */}
  <div className="flex-1">
    <label className="block text-[#5E2BE0] font-semibold mb-1">
      Nombre *
    </label>
    <input
      type="text"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
      onKeyDown={(e) => {
        const key = e.key;
        if (
          !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key) &&
          key !== "Backspace" &&
          key !== "Tab" &&
          key !== "Enter" &&
          key !== "ArrowLeft" &&
          key !== "ArrowRight"
        ) {
          e.preventDefault();
        }
      }}
      className="w-full border rounded-md p-2 text-[#5E2BE0] border-gray-300 focus:border-[#5E2BE0] focus:outline-none"
      placeholder="Ingresa tu nombre"
    />
  </div>

      {/* Apellido */}
      <div className="flex-1">
    <label className="block text-[#5E2BE0] font-semibold mb-1">
      Apellido *
    </label>
    <input
      type="text"
      value={apellido}
      onChange={(e) => setApellido(e.target.value)}
      onKeyDown={(e) => {
        const key = e.key;
        if (
          !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key) &&
          key !== "Backspace" &&
          key !== "Tab" &&
          key !== "Enter" &&
          key !== "ArrowLeft" &&
          key !== "ArrowRight"
        ) {
          e.preventDefault();
        }
      }}
      className="w-full border rounded-md p-2 text-[#5E2BE0] border-gray-300 focus:border-[#5E2BE0] focus:outline-none"
      placeholder="Ingresa tu apellido"
    />
      </div>
      </div>
            {/* Correo electrónico */}
          <div>
            <label className="block text-[#5E2BE0] font-semibold mb-1">
                Correo electrónico *
            </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border rounded-md p-2 text-[#5E2BE0] focus:outline-none ${
            email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)
             ? "border-red-500"
            : "border-gray-300 focus:border-[#5E2BE0]"
          }`}
          placeholder="nombre@gmail.com"
        />
  {email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) && (
    <p className="text-sm text-red-500 mt-1">
      Solo se permiten correos con @gmail.com
    </p>
  )}
        </div>
          {/* Contraseñas */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-[#5E2BE0] font-semibold mb-1">
                Crearte una Contraseña *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-md p-2 text-[#5E2BE0] focus:outline-none ${
                  contrasenasCoinciden && longitudValida
                    ? "border-gray-300 focus:border-[#5E2BE0]"
                    : "border-red-500"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
            </div>

            <div className="w-1/2">
              <label className="block text-[#5E2BE0] font-semibold mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className={`w-full border rounded-md p-2 text-[#5E2BE0] focus:outline-none ${
                  contrasenasCoinciden && longitudValida
                    ? "border-gray-300 focus:border-[#5E2BE0]"
                    : "border-red-500"
                }`}
              />
            </div>
          </div>

          {/* Mensajes de error */}
          {!longitudValida && password && (
            <p className="text-sm text-red-500">
              La contraseña debe tener al menos 8 caracteres.
            </p>
          )}
          {!contrasenasCoinciden && confirmarPassword && (
            <p className="text-sm text-red-500">
              Las contraseñas no coinciden.
            </p>
          )}

          {/* Botón Únete */}
          <button
            type="submit"
            disabled={!formularioValido}
            className={`w-full py-2 rounded-md font-semibold text-white transition-colors mt-3 ${
              formularioValido
                ? "bg-[#5E2BE0] hover:bg-[#4b22b8]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Únete
          </button>
        </form>

        {}
        <div className="my-4 flex items-center justify-center">
          <hr className="w-1/4 border-gray-300" />
          <span className="mx-2 text-gray-500">o</span>
          <hr className="w-1/4 border-gray-300" />
        </div>

        {/* Botones Google y Apple */}
        <div className="flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 hover:bg-gray-100 transition">
            <FcGoogle size={20} />
            <span className="text-gray-700 font-medium">
              Continuar con Google
            </span>
          </button>

          <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 hover:bg-gray-100 transition">
            <FaApple size={20} />
            <span className="text-gray-700 font-medium">
              Continuar con Apple
            </span>
          </button>
        </div>

        {/* Términos & condiciones */}
        <div className="flex items-center mt-4 text-sm text-gray-600">
          <input type="checkbox" className="mr-2" />
          <p>
            Al registrarte aceptas los <span className="underline cursor-pointer text-[#5E2BE0]">términos de uso</span> de Servineo.
          </p>
        </div>
      </div>
    </div>
  );
}

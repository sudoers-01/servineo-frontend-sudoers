"use client";

import { useState } from "react";

export default function FotoPerfil() {
  const [foto, setFoto] = useState<string | null>(null);

interface ManejarCambioEvent extends React.ChangeEvent<HTMLInputElement> {}

const manejarCambio = (e: ManejarCambioEvent) => {
    const archivo: File | undefined = e.target.files?.[0];
    if (archivo) {
        setFoto(URL.createObjectURL(archivo));
    }
};

  const eliminarFoto = () => setFoto(null);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#2BDDE0]">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[400px] text-center">
        <h2 className="text-xl font-semibold mb-2 text-black">
          Foto de perfil
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Sube una foto tuya para que otros te reconozcan.
        </p>
        <hr style={{ border: "1px solid #d1d5db", width: "80%" }} />
        <p className="text-sm text-gray-600 mb-4">
          Puedes elegir desde tu dispositivo.
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {foto ? (
              <img
                src={foto}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-full h-full text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
                1.79-4 4 1.79 4 4 4zm0 2c-2.67 
                0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>

          <input
            id="input-foto"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={manejarCambio}
          />

          <div className="flex gap-2">
            <label
              htmlFor="input-foto"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700"
            >
              {foto ? "Cambiar foto" : "Subir foto"}
            </label>
            {foto && (
              <button
                onClick={eliminarFoto}
                className="px-3 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                Eliminar foto
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button className="px-4 py-2 bg-[#5E2BE0] text-white rounded-full hover:bg-[#4b23b8]">
            Cancelar
          </button>

          <button className="px-4 py-2 bg-[#1AA7ED] text-white rounded-full hover:bg-[#1491cc] transition-colors">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

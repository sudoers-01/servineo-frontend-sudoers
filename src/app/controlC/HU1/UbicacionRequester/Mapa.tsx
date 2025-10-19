"use client";

import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

// 🔹 Importa el componente del mapa solo en cliente
const Mapa = dynamic(() => import("./Mapa"), { ssr: false });

export default function UbicacionRequester() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#E0EBFF]">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] sm:w-[400px] text-center">
        <h2 className="text-xl font-semibold mb-4 text-black">
          Ubicación del Requester
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Mueve el mapa o confirma tu ubicación actual para continuar.
        </p>

        {/* Componente del mapa */}
        <div className="rounded-lg overflow-hidden mb-4">
          <Mapa />
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Link href="/ctrlC/FotoPerfil">
            <button className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600">
              Atrás
            </button>
          </Link>

          <Link href="/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              Confirmar
            </button>
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

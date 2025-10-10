"use client"

import RegistroGoogle from "./registroGoogle"

export default function ContenedorRegistro() {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-bold text-center mb-2">Crear cuenta</h2>
      <p className="text-gray-500 text-center mb-4">
        Regístrate en Servineo para comenzar
      </p>
      
      <div className="text-center my-4 text-gray-400">— o —</div>

      <RegistroGoogle />
    </div>
  )
}
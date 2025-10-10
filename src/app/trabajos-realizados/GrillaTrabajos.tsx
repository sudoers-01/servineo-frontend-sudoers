// src/app/trabajos-realizados/GrillaTrabajos.tsx
import React from 'react';

const trabajos = [
  { id: 1, nombre: 'Reparación de tubería', fecha: '12/10/2025', estado: 'Completado' },
  { id: 2, nombre: 'Pintura de fachada', fecha: '13/10/2025', estado: 'Completado' },
  { id: 3, nombre: 'Instalación eléctrica', fecha: '14/10/2025', estado: 'Completado' },
  { id: 4, nombre: 'Mantenimiento de jardín', fecha: '15/10/2025', estado: 'Completado' },
];

const GrillaTrabajos = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 bg-white">
      <h1 className="text-3xl font-handwritten text-center mb-8 text-black">Servineo</h1>

      <div className="border rounded-lg p-3 inline-block mb-6">
        <span className="italic font-semibold text-lg text-black">
          Grilla de trabajos realizados
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
        {trabajos.map((trabajo) => (
          <div
            key={trabajo.id}
            className="flex justify-between items-center border rounded-xl p-4 bg-white shadow-sm border-green-500"
          >
            {/* Columna izquierda: nombre y fecha */}
            <div>
              <p className="italic font-medium text-black">Nombre del trabajo</p>
              <p className="italic text-black">{trabajo.nombre}</p>
              <p className="italic text-sm text-gray-500 mt-1">
                Fecha: {trabajo.fecha}
              </p>
            </div>

            {/* Columna central: estado */}
            <div className="text-center flex-1">
              <p className="text-green-500 font-semibold">{trabajo.estado}</p>
            </div>

            {/* Columna derecha: botón */}
            <div className="flex items-center justify-end">
              <button className="border rounded-lg px-4 py-2 text-white bg-[#1AA7ED] hover:bg-[#178AC3] transition-colors">
                Calificar trabajo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrillaTrabajos;

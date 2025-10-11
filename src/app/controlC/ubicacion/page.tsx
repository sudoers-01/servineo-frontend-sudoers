"use client";
import dynamic from "next/dynamic";
import React from "react";

// Importamos MapaLeaflet de forma dinámica, y desactivamos el SSR
const MapaLeaflet = dynamic(() => import("./MapaLeaflet"), {
  ssr: false,
});

export default function PageUbicacion() {
  return (
    <div className="w-full h-screen">
      <h1 className="text-2xl font-bold text-center my-4">Ubicación</h1>
      <MapaLeaflet />
    </div>
  );
}

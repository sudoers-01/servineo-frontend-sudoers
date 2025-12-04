'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/Mapa/Map'), {
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
      Cargando mapa...
    </div>
  ),
  ssr: false
});

export default function MapSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <section className='w-full py-16 px-4 bg-gray-50 scroll-mt-24'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Encuentra Servicios Cerca de Ti
          </h2>
        </div>
        
        {/* ✅ ID en el contenedor del mapa */}
        <div 
          id='titulo-seccion-mapa'
          className='h-[60vh] w-full bg-gray-100 rounded-xl overflow-hidden relative shadow-sm border border-gray-200'
        >
          {isMounted && <MapComponent />}
        </div>
      </div>
    </section>
  );
}
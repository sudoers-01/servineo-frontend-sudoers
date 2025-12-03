'use client';

import { useEffect, useState } from 'react';
import { useTour } from '@reactour/tour';
import { tourSteps } from './TourSteps';

export function TourLogic() {
  const { setSteps, setIsOpen, setCurrentStep, isOpen } = useTour();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Asegurar que las funciones del contexto estén disponibles
    if (!setSteps || !setIsOpen || !setCurrentStep) return;

    // Filtrar pasos según dispositivo
    const isMobile = window.innerWidth < 1024;
    const filteredSteps = tourSteps.filter(step => {
      if (isMobile) return step.selector !== '#tour-auth-buttons-desktop';
      return step.selector !== '#tour-auth-buttons-mobile';
    });

    setSteps(filteredSteps);

    // Lógica de inicio
    const tourVisto = localStorage.getItem('servineoTourVisto');
   
    // Si NO se ha visto (o se borró la key al hacer clic en "Ver guía nuevamente")
    if (!tourVisto) {
      setCurrentStep(0);
     
      // Usamos un timeout un poco más largo para asegurar que la UI cargó completamente
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasStarted(true);
      }, 1500);
     
      return () => clearTimeout(timer);
    }
  }, [setSteps, setIsOpen, setCurrentStep]);

  // Guardar que se vio SOLO al cerrar el tour voluntariamente
  useEffect(() => {
    if (!isOpen && hasStarted) {
       localStorage.setItem('servineoTourVisto', 'true');
       setHasStarted(false);
    }
  }, [isOpen, hasStarted]);

  return null;
}
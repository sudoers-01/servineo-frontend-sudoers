'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTour } from '@reactour/tour';
import { tourSteps } from './TourSteps';

export function TourLogic() {
  const pathname = usePathname();
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

    // IMPORTANTE: Solo iniciar el tour si estamos en la página principal
    const isHomePage = pathname === '/' || pathname === '/es' || pathname === '/en';
    
    if (!isHomePage) {
      // Si no estamos en el home, no iniciar el tour
      return;
    }

    // Lógica de inicio
    const tourVisto = typeof window !== 'undefined' ? localStorage.getItem('servineoTourVisto') : null;

    // Forzar mostrar en entorno de desarrollo o si se indica por query param (?tour=1)
    const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const forceShow = isDev || isLocalhost || urlParams.get('tour') === '1';

    // Si NO se ha visto (o se borró la key) o estamos forzando la visualización, iniciamos
    if (!tourVisto || forceShow) {
      setCurrentStep(0);

      // Usamos un timeout un poco más largo para asegurar que la UI cargó completamente
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasStarted(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [setSteps, setIsOpen, setCurrentStep, pathname]);

  // Guardar que se vio SOLO al cerrar el tour voluntariamente
  useEffect(() => {
    if (!isOpen && hasStarted) {
      // En entorno de desarrollo/local no persistimos la marca para que se pueda ver siempre
      const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
      if (!isDev && !isLocalhost) {
        localStorage.setItem('servineoTourVisto', 'true');
      }
      setHasStarted(false);
    }
  }, [isOpen, hasStarted]);

  return null;
}
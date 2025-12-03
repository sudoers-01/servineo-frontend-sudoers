import { StepType } from '@reactour/tour';

export const tourSteps: StepType[] = [
  {
    selector: '#tour-start-point',
    content: ({ setIsOpen, setCurrentStep }: any) => (
      <div className="text-center p-2">
        <h3 className="text-2xl font-bold text-[#2B6AE0] mb-3">¡Hola! Bienvenido a Servineo</h3>
        <p className="text-gray-700 leading-relaxed text-base mb-5">
          ¿Te gustaría realizar un breve recorrido para conocer las funciones principales de la plataforma?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
                setIsOpen(false);
                localStorage.setItem('servineoTourVisto', 'true');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition text-sm"
          >
            No, gracias
          </button>
          <button
            onClick={() => setCurrentStep(1)}
            className="px-4 py-2 bg-[#2B6AE0] text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md text-sm"
          >
            Iniciar Recorrido
          </button>
        </div>
      </div>
    ),
    position: 'center',
  },
  {
    selector: '#tour-search-bar',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">1. Búsqueda Inteligente</h4>
        <p className="text-gray-600 text-sm">
          Escribe aquí el servicio que necesitas (ej. "Plomero") para encontrar ayuda rápidamente.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '#tour-map-section',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">2. Mapa de Fixers</h4>
        <p className="text-gray-600 text-sm">
          Visualiza a los profesionales en tu zona en tiempo real.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '#tour-inspiration-section',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">3. Inspírate</h4>
        <p className="text-gray-600 text-sm">
          Mira proyectos realizados por nuestros profesionales para tomar ideas.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '#tour-recent-offers',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">4. Ofertas Recientes</h4>
        <p className="text-gray-600 text-sm">
          Revisa las últimas solicitudes publicadas en la plataforma.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '#tour-services-section',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">5. Catálogo de Servicios</h4>
        <p className="text-gray-600 text-sm">
          Explora todas las categorías disponibles: Plomería, Electricidad, etc.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '#tour-how-it-works',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">6. ¿Cómo funciona?</h4>
        <p className="text-gray-600 text-sm">
          Entiende el proceso de contratación paso a paso.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '#tour-cta-section',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">7. ¡Empieza Ahora!</h4>
        <p className="text-gray-600 text-sm">
          Si no encuentras lo que buscas, contáctanos directamente aquí.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '#footer-principal',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">8. Información y Ayuda</h4>
        <p className="text-gray-600 text-sm">
          Encuentra soporte, enlaces legales y la opción para <strong>ver esta guía nuevamente</strong>.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '#tour-auth-buttons-desktop',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">9. Tu Cuenta</h4>
        <p className="text-gray-600 text-sm">
          Finalmente, inicia sesión o regístrate para comenzar.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '#tour-auth-buttons-mobile',
    content: (
      <div>
        <h4 className="font-bold text-lg mb-2 text-gray-800">9. Tu Cuenta</h4>
        <p className="text-gray-600 text-sm">
          Finalmente, inicia sesión o regístrate para comenzar.
        </p>
      </div>
    ),
    position: 'bottom',
  },
];
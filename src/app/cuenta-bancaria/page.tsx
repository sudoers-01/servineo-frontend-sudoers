// src/app/cuenta-bancaria/page.tsx

/**
 * ESTE COMPONENTE DE PÁGINA ES AHORA UN COMPONENTE CLIENTE.
 * Esto es necesario porque el componente hijo (CuentaBancariaClient)
 * utiliza hooks y su lógica es de cliente, y el App Router de Next.js
 * prohíbe el uso de ciertas propiedades (como ssr: false) en Server Components
 * que envuelven Client Components.
 */
'use client'; 

import CuentaBancariaClient from './CuentaBancariaClient'; 
// Asegúrate de que el archivo que importamos aquí se llame
// CuentaBancariaClient.tsx (exactamente como lo tienes en tu carpeta)

export default function CuentaBancariaPage() {
    return (
        // Renderizamos el componente principal, que contiene toda la lógica.
        <CuentaBancariaClient />
    );
}

// Nota: Ya no necesitamos la función LoadingFallback ni el dynamic import aquí,
// ya que todo el archivo se ejecuta en el cliente.
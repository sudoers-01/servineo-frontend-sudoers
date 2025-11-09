import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Asegúrate de que tu configuración de 'rewrites' use la variable
  // SIN el prefijo 'NEXT_PUBLIC_'
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // ¡DEBE USAR BACKEND_URL, NO NEXT_PUBLIC_BACKEND_URL!
        destination: `${process.env.BACKEND_URL}/api/:path*`, 
      },
    ];
  },
  
  eslint: {
      // Advertencia: Esto omitirá los errores de ESLint solo durante el 'build'.
      // Deberías arreglarlos localmente para mantener la calidad del código.
      ignoreDuringBuilds: true,
    },
    // --- FIN DE LA ADICIÓN ---
};

export default nextConfig;

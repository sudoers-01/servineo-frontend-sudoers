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
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    console.log(`⚡ Conectando rewrite a: ${backendUrl}`);

    return [
      {
        source: '/api/:path*', // El asterisco * es importante para que coincida con subrutas
        destination: `${backendUrl}/api/:path*`, 
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Advertencia: Esto omitirá los errores de TypeScript durante el 'build'.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
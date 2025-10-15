/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend =
      process.env.NODE_ENV === "production"
        ? process.env.BACKEND_URL
        : "http://localhost:4000"; // 👈 tu backend
    return [
      // /api/* del front → /api/* del backend (en 3001)
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;

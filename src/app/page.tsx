'use client';

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-200 text-white">
      {/* Título principal */}
      <motion.h1
        className="text-6xl md:text-7xl font-extrabold mb-10 drop-shadow-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <span className="bg-gradient-to-r from-servineo-100 via-servineo-400 to-servineo-600 bg-clip-text text-transparent">
          SERVINEO
        </span>
      </motion.h1>

      {/* Botón "Empezar" */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <Link
          href="/Control_C"
          className="relative inline-block px-12 py-4 text-lg font-semibold rounded-full overflow-hidden 
          bg-white text-servineo-500 shadow-xl transition-all duration-300 
          hover:scale-105 hover:shadow-servineo-400/40"
        >
          <span className="relative z-10">Empezar</span>
          <span className="absolute inset-0 bg-gradient-to-r from-servineo-400 to-servineo-600 opacity-0 hover:opacity-100 transition-all duration-300 rounded-full"></span>
        </Link>
      </motion.div>
    </div>
  );
}

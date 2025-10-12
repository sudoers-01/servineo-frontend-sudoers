'use client';

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-600 text-white">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Bienvenido a <span className="text-yellow-300">SERVINEO modo requester </span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
 
        Aquí podrás acceder a las funciones principales de{" "}
        <span className="font-semibold">User Management</span> en un entorno intuitivo y moderno.
      </motion.p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <Link
          href="/Control_C"
          className="bg-white text-servineo-600 px-10 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-servineo-200 hover:text-white transition"
        >
          Empezar
        </Link>
      </motion.div>
    </div>
  );
}


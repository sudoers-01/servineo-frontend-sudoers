"use client";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserMenu from "./components/UI/menuUsuario";
import { useAuth } from "./hooks/usoAutentificacion";

export default function HomePage() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      toast.success(`¡Bienvenido, ${user.name || "usuario"}! 👋`, {
        position: "bottom-right", 
        autoClose: 4000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col relative">
      <header className="w-full flex justify-between items-center px-10 py-6 bg-white/90 backdrop-blur-md shadow-md fixed top-0 left-0 z-30">
        <h1 className="text-3xl font-extrabold text-[#2B31E0] tracking-tight">
          Servineo
        </h1>
        <UserMenu />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24">
        <h2 className="text-6xl font-extrabold text-[#2B31E0] mb-6">
          ¡Bienvenido a Servineo!
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl">
          Conecta con profesionales y encuentra el servicio que necesitas de forma
          rápida, segura y confiable.
        </p>
      </main>

      
      <ToastContainer position="bottom-right" autoClose={4000} />
    </div>
  );
}



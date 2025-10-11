"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc"; 
import  Button  from "./button"; 

export default function GoogleButton() {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Token de Google:", tokenResponse.access_token);
    },
    onError: () => {
      console.error("Error al iniciar sesión con Google");
    },
  });

  return (
    <button
        onClick={() => login()}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg shadow-sm text-black !important transition-colors"
        >
        <FcGoogle size={24} />
        Continuar con Google
    </button>
  );
}
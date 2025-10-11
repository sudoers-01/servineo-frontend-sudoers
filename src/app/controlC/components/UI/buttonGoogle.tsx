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
    <Button
      onClick={() => login()}
      className="flex items-center justify-center gap-2 bg-white text-black border hover:bg-gray-100"
    >
      <FcGoogle size={24} />
      Continuar con Google
    </Button>
  );
}
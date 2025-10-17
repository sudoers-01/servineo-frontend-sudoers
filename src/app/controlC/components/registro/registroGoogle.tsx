"use client";

import GoogleButton from "../UI/buttonGoogle";
import { enviarTokenGoogle, GoogleAuthResponse } from "../../services/conexionBackend";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/usoAutentificacion"; 

export default function RegistroGoogle({ onSuccessClose }: { onSuccessClose?: () => void }) {
  const router = useRouter();
  const { setUser } = useAuth(); 

  const handleLoginSuccess = async (credentialResponse: any) => {
    const token = credentialResponse?.credential;
    if (!token) {
      console.error("No se recibió el token de Google");
      return;
    }

    try {
      const data: GoogleAuthResponse = await enviarTokenGoogle(token);
      console.log("Respuesta del backend:", data);

      if (onSuccessClose) onSuccessClose();

      if (data.firstTime) {
        sessionStorage.setItem("google_token_temp", token);
        router.push("/controlC/ubicacion");
        return; 
      }

      if (data.token) {
        localStorage.setItem("servineo_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("servineo_user", JSON.stringify(data.user));
        setUser(data.user);
      }

      router.push("/controlC");

    } catch (error) {
      console.error("Error al enviar el token al backend:", error);
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleButton onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}


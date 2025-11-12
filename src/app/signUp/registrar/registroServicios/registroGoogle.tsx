"use client";

import GoogleButton from "@/Components/requester/botonRegistro/buttonGoogle";
import { enviarTokenGoogle, GoogleAuthResponse } from "@/app/redux/services/auth/registro";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Components/requester/auth/usoAutentificacion";
import { CredentialResponse } from "@react-oauth/google";
export default function RegistroGoogle({ onSuccessClose }: { onSuccessClose?: () => void }) {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
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
        router.push("/signUp/registrar/registroUbicacion");
        return;
      }

      if (data.token) {
        localStorage.setItem("servineo_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("servineo_user", JSON.stringify(data.user));
        setUser(data.user);
      }

      router.push("/");
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

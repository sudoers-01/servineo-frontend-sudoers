"use client"

import GoogleButton from "../UI/buttonGoogle";
import { enviarTokenGoogle } from "../../services/conexionBackend";

export default function RegistroGoogle() {
  const handleLoginSuccess = async(credentialResponse: any) => {
    const token = credentialResponse?.credential;
    if (!token) {
      console.error("No se recibió el token de Google");
      return;
    }
    try {
      const data = await enviarTokenGoogle(token);
      console.log("Respuesta del backend:", data);
    } catch (error) {
      console.error("Error al enviar el token al backend:", error);
    }
    };
  return (
    <div className="flex justify-center">
      <GoogleButton onLoginSuccess={handleLoginSuccess}/>
    </div>
  );
}


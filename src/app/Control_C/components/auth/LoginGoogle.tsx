"use client";

import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { api, ApiResponse } from "@/app/Control_C/lib/api";

// ✅ Declaramos la interfaz para las props del componente
interface LoginGoogleProps {
  onMensajeChange: (mensaje: string) => void;
}

export default function LoginGoogle({ onMensajeChange }: LoginGoogleProps) {
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    onMensajeChange(""); // Limpia cualquier mensaje previo

    try {
      const res: ApiResponse<any> = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });

      if (res.success) {
        onMensajeChange(`✅ ${res.data?.message ?? "Login con Google exitoso"}`);
        //window.location.href = "/";
      } else {
        onMensajeChange(`❌ ${res.data?.message ?? res.error ?? "Error"}`);
      }
    } catch (err: any) {
      onMensajeChange(`❌ ${err?.message ?? "Error al conectar con el backend"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onMensajeChange("❌ Error al iniciar con Google")}
        />
      </div>
    </div>
  );
}

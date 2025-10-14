"use client";


import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { api, ApiResponse } from "@/app/Control_C/lib/api";

export default function LoginGoogle() {
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setMensaje("");


    try {
      const res: ApiResponse<any> = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });


      if (res.success) {
        setMensaje(`✅ ${res.data?.message ?? "Login con Google exitoso"}`);
          // Puedes decidir si redirigir o no
          window.location.href = "/";
      } else {
        setMensaje(`❌ ${res.data?.message ?? res.error ?? "Error al iniciar sesión"}`);
      }
    } catch (err: any) {
      setMensaje(`❌ ${err?.message ?? "Error al conectar con el backend"}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setMensaje("❌ Error al iniciar con Google")}
        />
      </div>


      {mensaje && (
        <p
          className={`text-sm ${
            mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
          } text-center mt-2`}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}


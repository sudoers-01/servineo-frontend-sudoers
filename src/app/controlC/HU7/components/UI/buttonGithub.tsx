"use client";
import React, { useState } from "react";
import { Github } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function GithubButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGithub = () => {
    setLoading(true);

    const popup = window.open(
      "http://localhost:8000/auth/github",
      "GitHubLogin",
      "width=600,height=700"
    );
    if (!popup) {
      toast.error("No se pudo abrir la ventana de GitHub");
      setLoading(false);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:8000") return;

      const data = event.data;

      if (data.type === "GITHUB_AUTH_SUCCESS") {
        toast.success("Autenticación con GitHub exitosa");
        localStorage.setItem("servineo_token", data.token);

        if (data.isFirstTime) {
          router.push("/controlC/HU3/ubicacion");
        } else {
          router.push("/"); 
        }

        window.removeEventListener("message", handleMessage);
        setLoading(false);
        popup.close();
      }

      if (data.type === "GITHUB_AUTH_ERROR") {
        toast.error(data.message || "Error en autenticación con GitHub");
        window.removeEventListener("message", handleMessage);
        setLoading(false);
        popup.close();
      }
    };

    window.addEventListener("message", handleMessage);
  };

  return (
    <button
      onClick={handleGithub}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-100"
    >
      <Github size={18} />
      {loading ? "Cargando..." : "Continuar con GitHub"}
    </button>
  );
}

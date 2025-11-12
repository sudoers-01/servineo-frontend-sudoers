"use client";
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Components/requester/auth/usoAutentificacion";

export default function GithubButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { setUser } = useAuth();

  const handleGithub = () => {
    setLoading(true);

    const popup = window.open(
      `${BASE_URL}/auth/github`,
      "GitHubLogin",
      "width=600,height=700"
    );
    if (!popup) {
      setLoading(false);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== BASE_URL) return;
      const data = event.data;

      if (data.type === "GITHUB_AUTH_SUCCESS") {
        localStorage.setItem("servineo_token", data.token);

        if (data.user) {
          localStorage.setItem("servineo_user", JSON.stringify(data.user));
          setUser(data.user);
        }

        if (data.isFirstTime) {
          router.push("/signUp/registrar/registroUbicacion");
        } else {
          router.push("/");
        }

        window.removeEventListener("message", handleMessage);
        setLoading(false);
        popup.close();
      }

      if (data.type === "GITHUB_AUTH_ERROR") {
        window.removeEventListener("message", handleMessage);
        setLoading(false);
        popup.close();
      }
    };

    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleGithub}
        disabled={loading}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg shadow-sm text-black transition-colors"
      >
        <FaGithub size={24} className="text-black" />
        {loading ? "Cargando..." : "Continuar con GitHub"}
      </button>
    </div>
  );
}

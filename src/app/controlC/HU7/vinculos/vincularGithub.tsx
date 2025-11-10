"use client";

import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VincularGithubProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLinked?: (client: any) => void; // callback opcional al vincular
}

export default function VincularGithub({ onLinked }: VincularGithubProps) {
  const [loading, setLoading] = useState(false);

  const handleVincularGitHub = () => {
    const token = localStorage.getItem("servineo_token");
    if (!token) {
      toast.error("No hay sesión activa para vincular cuenta");
      return;
    }

    setLoading(true);

    // 👇 Empaquetamos modo y token dentro de state
    const state = encodeURIComponent(
      JSON.stringify({
        mode: "link",
        token,
      })
    );

    const popup = window.open(
      `https://backdos.vercel.app/auth/github?state=${state}`,
      "GitHubLink",
      "width=600,height=700"
    );

    if (!popup) {
      toast.error("No se pudo abrir la ventana de GitHub");
      setLoading(false);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://backdos.vercel.app") return;

      const data = event.data;

      if (data.type === "GITHUB_LINK_SUCCESS") {
        toast.success("Cuenta de GitHub vinculada con éxito ✅");
        setLoading(false);
        popup.close();
        window.removeEventListener("message", handleMessage);

        if (onLinked) onLinked(data.client);
      } else if (data.type === "GITHUB_LINK_ERROR") {
        toast.error(data.message || "Error al vincular cuenta GitHub ❌");
        setLoading(false);
        popup.close();
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);
  };

  return (
    <div className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm hover:bg-gray-50 transition">
      <div className="flex items-center gap-3">
        <FaGithub size={30} className="text-gray-800" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">GitHub</span>
          <span className="text-xs text-gray-500">
            Vincula tu cuenta de GitHub
          </span>
        </div>
      </div>
      <div>
        <button
          onClick={handleVincularGitHub}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-900 transition disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Vinculando...
            </>
          ) : (
            "Vincular"
          )}
        </button>
      </div>
    </div>
  );
}

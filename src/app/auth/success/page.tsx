"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../controlC/HU3/hooks/usoAutentificacion"; 

export default function AuthSuccess() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      router.push("/signup");
      return;
    }

    localStorage.setItem("servineo_token", token);

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload) {
        const user = {
          id: payload.id ?? payload.sub ?? payload.userId ?? payload.email,
          name: payload.name,
          email: payload.email,
          picture: payload.picture ?? null
        };
        localStorage.setItem("servineo_user", JSON.stringify(user));
        setUser(user);
      }
    } catch (e) {
      console.error("Error al decodificar JWT", e);
    }

    router.push("/");
  }, [router, setUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-700 text-lg">Autenticando…</p>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/usoAutentificacion";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      const filteredUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      };

      const storedUser = localStorage.getItem("servineo_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const keys = Object.keys(parsed);
        if (keys.some((k) => !["id", "name", "email", "picture"].includes(k))) {
          localStorage.setItem("servineo_user", JSON.stringify(filteredUser));
        }
      }
    }
  }, [user]);

  if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPictureSrc = (pic: any): string | null => {
    if (!pic) return null;
    if (typeof pic === "string") {
      try {
        const parsed = JSON.parse(pic);
        pic = parsed;
      } catch {
        if (pic.startsWith("data:") || pic.startsWith("http") || pic.startsWith("//")) return pic;
        return null;
      }
    }
    if (typeof pic === "object") {
      return (
        pic.url ||
        pic.data?.url ||
        pic.picture?.data?.url ||
        pic.picture?.url ||
        pic.src ||
        null
      );
    }
    return null;
  };

  const pictureSrc = getPictureSrc(user.picture);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú de usuario"
        aria-expanded={open}
        className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden"
      >
        <img
          src={
            pictureSrc
              ? pictureSrc
              : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
          }
          alt="Perfil"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src =
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
          }}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 transition-all duration-150">
          <div className="px-4 py-2 text-gray-700 border-b font-semibold">
            {user.name || "Usuario"}
          </div>
          <button
            className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              router.push("/controlC/HU5");
            }}
          >
            Editar perfil
          </button>

          {/* 🔹 Nuevo botón para Métodos de Inicio de Sesión */}
          <button
            className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              router.push("/controlC/HU7");
            }}
          >
            Métodos de Inicio de Sesión
          </button>

          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/usoAutentificacion";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null; 

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden"
      >
        <img
          src={user.picture || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
          alt="Perfil"
          className="w-full h-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="px-4 py-2 text-gray-700 border-b font-semibold">
            {user.name || "Usuario"}
          </div>
          <button
            className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
            onClick={() => alert("Editar perfil aún no implementado")}
          >
            Editar perfil
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

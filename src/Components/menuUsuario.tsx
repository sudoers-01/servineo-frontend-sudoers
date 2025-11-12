'use client';

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../app/lib/hooks/usoAutentificacion";
import { useRouter } from "next/navigation";

type Props = {
  open?: boolean;
  onToggle?: () => void;
};

export default function UserMenu({ open: openProp, onToggle }: Props) {
  const { user, logout } = useAuth();
  const [openInternal, setOpenInternal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isControlled = typeof onToggle === "function";
  const open = isControlled ? Boolean(openProp) : openInternal;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isControlled) {
        } else {
          setOpenInternal(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isControlled]);

  if (!user) return null;

  function toggle() {
    if (isControlled) {
      onToggle && onToggle();
    } else {
      setOpenInternal((s) => !s);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {open && (
        <div className="absolute right-0 mt-7 w-56 
            bg-white border border-gray-200 rounded-xl shadow-xl z-50 
            overflow-hidden text-center transform transition-all duration-200
            origin-top scale-95 animate-slideDown">
          <ul className="py-1">
            <li>
              <button
                className="w-full text-center px-4 py-3 hover:bg-gray-100 text-gray-700 transition cursor-pointer hover:scale-[1.03] hover:font-semibold   transition-all duration-300 ease-out"
                onClick={() => {
                  if (isControlled) {
                    onToggle && onToggle();
                    router.push("/controlC/HU5");
                  } else {
                    setOpenInternal(false);
                    router.push("/controlC/HU5");
                  }
                }}
              >
                Perfil
              </button>
            </li>

            <li>
              <button
                className="w-full text-center px-4 py-3 hover:bg-gray-100 text-gray-700 cursor-pointer hover:scale-[1.03] hover:font-semibold   transition-all duration-300 ease-out"
                onClick={() => {
                   if (isControlled) {
                    onToggle && onToggle();
                    router.push("/userManagement/requester/settings");
                  } else {
                    setOpenInternal(false);
                    router.push("/userManagement/requester/settings");
                  }
                }}
              >
                Configuración
              </button>
            </li>

            <li>
              <button
                className="w-full text-center px-4 py-3 hover:bg-red-50 text-red-600 cursor-pointer hover:scale-[1.03] hover:font-semibold   transition-all duration-200 ease-in"
                onClick={() => {
                  if (isControlled) {
                    onToggle && onToggle();
                    logout();
                  } else {
                    setOpenInternal(false);
                    logout();
                  }
                }}
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
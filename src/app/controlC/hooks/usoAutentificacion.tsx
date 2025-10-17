"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { verificarSesionBackend } from "../services/conexionBackend";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("servineo_token");

    if (!token) {
      setLoading(false);
      return;
    }

    verificarSesionBackend(token)
      .then((data) => {
        if (data.valid) {
          setUser(data.user);
        } else {
          localStorage.removeItem("servineo_token");
          localStorage.removeItem("servineo_user");
        }
      })
      .catch(() => {
        localStorage.removeItem("servineo_token");
        localStorage.removeItem("servineo_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("servineo_token");
    localStorage.removeItem("servineo_user");
    setUser(null);
    window.location.href = "/controlC";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
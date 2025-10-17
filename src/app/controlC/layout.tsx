"use client";

import { AuthProvider } from "./hooks/usoAutentificacion";

export default function ControlCLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

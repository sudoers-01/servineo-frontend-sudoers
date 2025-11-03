'use client';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Roboto } from 'next/font/google';
import './globals.css';
import { AuthProvider } from "./controlC/HU3/hooks/usoAutentificacion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ControlCLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>
        <AuthProvider>
          {children}
          {/* Contenedor global para todos los toasts */}
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            pauseOnHover
            draggable
            theme="colored"
          />
        </AuthProvider>
      </body>
    </html>
  );
}

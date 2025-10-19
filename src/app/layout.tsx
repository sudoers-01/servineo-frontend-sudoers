import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from "./controlC/HU3/hooks/usoAutentificacion";

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Servineo',
  description: 'Plataforma de inicio de sesión',
};

export default function ControlCLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>
         <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}

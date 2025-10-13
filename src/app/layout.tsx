import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { GoogleOAuthProvider } from "@react-oauth/google";

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // normal, medium, bold
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Servineo',
  description: 'Plataforma de inicio de sesión',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="es">
      <body className={`${roboto.variable} font-sans antialiased`}>
        {/* 🌍 Provider global para toda la app */}
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );

}

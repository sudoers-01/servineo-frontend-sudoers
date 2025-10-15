"use client";


import { GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  console.log("Google Client ID cargado:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);


  return (
    // sin <html> ni <body>, mantiene la interfaz del global
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {children}
    </GoogleOAuthProvider>
  );
}


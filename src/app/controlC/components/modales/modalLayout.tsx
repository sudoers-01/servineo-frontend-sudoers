"use client"

import { ReactNode } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"

interface GoogleModalLayoutProps {
  children: ReactNode
}

export default function GoogleModalLayout({ children }: GoogleModalLayoutProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {children}
    </GoogleOAuthProvider>
  )
}
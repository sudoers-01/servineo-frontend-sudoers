"use client"

import { GoogleLogin } from "@react-oauth/google"
import GoogleButton from "../UI/buttonGoogle";

export default function RegistroGoogle({ onSuccess }: { onSuccess?: (data: any) => void }) {
  const handleLoginSuccess = (credentialResponse: any) => {
    if (onSuccess) onSuccess(credentialResponse)
    console.log("Login Google:", credentialResponse)
  }

  return (
    <div className="flex justify-center">
      <GoogleButton />
    </div>
  )
}

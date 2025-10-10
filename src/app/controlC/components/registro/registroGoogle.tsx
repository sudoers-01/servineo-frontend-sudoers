"use client"

import { GoogleLogin } from "@react-oauth/google"

export default function RegistroGoogle({ onSuccess }: { onSuccess?: (data: any) => void }) {
  const handleLoginSuccess = (credentialResponse: any) => {
    if (onSuccess) onSuccess(credentialResponse)
    console.log("Login Google:", credentialResponse)
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => console.log("Login Google fallido")}
      />
    </div>
  )
}

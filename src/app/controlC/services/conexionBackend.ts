export const BASE_URL = "http://localhost:8000/api/controlC";

export interface GoogleAuthResponse {
  status: "ok" | "firstTime" | "exists" | "error";
  firstTime?: boolean;
  token?: string;
  user?: {
    email: string;
    name?: string;
    picture?: string; 
  };
  message?: string;
}

export async function enviarTokenGoogle(token: string): Promise<GoogleAuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/google/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    throw error;
  }
}

export async function verificarSesionBackend(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/google/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Token inválido o expirado");
    }

    return await res.json(); 
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    throw error;
  }
}
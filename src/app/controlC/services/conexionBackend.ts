export const BASE_URL = "http://localhost:8000/api/controlC";

interface GoogleAuthResponse {
  success: boolean;
  message?: string;
  user?: any;
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

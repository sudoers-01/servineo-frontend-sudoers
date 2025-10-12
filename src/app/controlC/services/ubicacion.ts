export const BASE_URL = "http://localhost:8000/api/controlC";

interface UbicacionResponse {
  success: boolean;
  message?: string;
}

export async function enviarUbicacion(lat: number, lng: number): Promise<UbicacionResponse> {
  try {
    const res = await fetch(`${BASE_URL}/ubicacion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng }),
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error al enviar la ubicación al backend:", error);
    throw error;
  }
}

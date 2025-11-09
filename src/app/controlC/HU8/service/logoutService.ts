import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function cerrarTodasSesiones(): Promise<LogoutResponse> {
  const token = localStorage.getItem("servineo_token");

  if (!token) {
    throw new Error("No se encontró token de autenticación.");
  }

  try {
    const response = await axios.post(
      `${API_URL}/cerrar-sesiones/logout-all`,
      {}, // cuerpo vacío
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );


    return response.data;
  } catch (error: any) {
    console.error("Error al cerrar todas las sesiones:", error);
    throw error;
  }
}

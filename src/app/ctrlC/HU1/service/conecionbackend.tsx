"use client";
export const BASE_URL = "http://localhost:8000/api/controlC";

export interface User {
  email: string;
  name?: string;
  picture?: string;
}

export interface RegistroResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export async function enviarRegistroManual(name: string, email: string, password: string): Promise<RegistroResponse> {
  try {
    const url = `${BASE_URL}/registro/manual`;
    
    console.log(`Enviando registro a: ${url}`); // Depuración: Verificar la URL

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    // 1. VERIFICACIÓN DEL CONTENIDO DE LA RESPUESTA
    const contentType = res.headers.get("content-type");
    
    // Si el servidor respondió con un HTML, es probable que sea un error 404/500
    if (contentType && contentType.includes("text/html")) {
      const textError = await res.text();
      console.error("Respuesta HTML del servidor:", textError.substring(0, 100) + "...");
      
      // Arroja un error claro si la ruta no existe o el backend falló
      throw new Error(
        `Error ${res.status}: La API no respondió con JSON. (Respuesta: HTML). Confirme que la ruta del backend (${url}) esté activa y correcta.`
      );
    }

    // 2. MANEJO DE ERRORES HTTP (4xx o 5xx)
    if (!res.ok) {
      // Intentar parsear el error como JSON
      try {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error del servidor: ${res.status}`);
      } catch (e) {
        // Si no se puede parsear como JSON, arrojar el estado
        throw new Error(`Error ${res.status}: No se pudo obtener el mensaje de error del servidor.`);
      }
    }

    // 3. RESPUESTA EXITOSA (2xx)
    return await res.json();

  } catch (error) {
    console.error("Error al registrar manualmente (red/código):", error);
    throw error;
  }
}
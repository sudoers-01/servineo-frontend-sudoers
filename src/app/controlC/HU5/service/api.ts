const BASE_URL = 'http://localhost:8000'; 
const MODIFICAR_DATOS_BASE = '/api/controlC/modificar-datos';

export interface User {
  email: string;
  name?: string;
  picture?: string;
  phone?: string;
  direction?: string;
  coordinates?: [number, number]; 
}

export interface UpdateRequesterData {
  phone: string;
  direction: string;
  coordinates: [number, number];
}

export interface RequesterData {
  requesterId: string;
  phone: string;
  direction: string;
  coordinates: [number, number];
}

export async function obtenerDatosUsuarioLogueado(): Promise<RequesterData> {
  const token = localStorage.getItem("servineo_token");

  if (!token) {
    throw new Error("No se encontró token de autenticación.");
  }

  try {
    // 👈 URL CORREGIDA: Agregando la ruta completa del router
    const fullUrl = `${BASE_URL}${MODIFICAR_DATOS_BASE}/requester/data`;

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) {
        // Mejorar el manejo de errores para mostrar el mensaje del backend si existe
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: No se pudo cargar el perfil.`);
    }

    const data = await res.json();
    return data; 
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    throw error;
  }
}

export async function actualizarDatosUsuario(
  data: UpdateRequesterData
): Promise<{ success: boolean; message?: string }> {
  const token = localStorage.getItem("servineo_token");

  if (!token) {
    return { success: false, message: "No autenticado." };
  }

  try {
    // 👈 URL CORREGIDA: Agregando la ruta completa del router
    const fullUrl = `${BASE_URL}${MODIFICAR_DATOS_BASE}/requester/update-profile`;

    const res = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    
    if (!res.ok) {
      throw new Error(responseData.message || `Error ${res.status}: No se pudo actualizar.`);
    }

    return { success: true, message: "Perfil actualizado con éxito." };
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return { success: false, message: (error as Error).message || "Fallo en la conexión o servidor." };
  }
}
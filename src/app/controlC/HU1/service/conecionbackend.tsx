const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''; 

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

export interface UbicacionResponse {
  success: boolean;
  message?: string;
}

export async function enviarRegistroManual(
  name: string,
  email: string,
  password: string
): Promise<RegistroResponse> {
  const url = `${BASE_URL}/registro/manual`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const contentType = res.headers.get("content-type");

    if (contentType?.includes("text/html")) {
      const textError = await res.text();
      throw new Error(
        `Error ${res.status}: La API no respondió con JSON. Respuesta: ${textError.slice(
          0,
          120
        )}`
      );
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error del servidor: ${res.status}`);
    }

    return (await res.json()) as RegistroResponse;
  } catch (error) {
    console.error("Error al registrar manualmente:", error);
    throw error;
  }
}

export async function enviarUbicacion(
    lat: number, 
    lng: number,
  direccion: string | null,
  departamento: string | null,
  pais: string | null
): Promise<UbicacionResponse> {
  const url = `${BASE_URL}/ubicacion`;

    try {
    const token = localStorage.getItem("servineo_token");
    if (!token) throw new Error("No se encontró el token de autenticación.");

    const res = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lat, lng, direccion, departamento, pais }),
    });

    const contentType = res.headers.get("content-type");

    if (contentType?.includes("text/html")) {
        const textError = await res.text();
        throw new Error(
        `Error ${res.status}: La API no respondió con JSON. Respuesta: ${textError.slice(
            0,
            120
        )}`
      );
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${res.status}`);
    }

    return (await res.json()) as UbicacionResponse;
    } catch (error) {
    console.error("Error al enviar la ubicación:", error);
    throw error;
    }
}


export interface FotoResponse {
  success: boolean;
  message?: string;
  user?: {
    name: string;
    email: string;
    picture?: string;
  };
}

export async function enviarFotoPerfil(usuarioId: string, archivo: File): Promise<FotoResponse> {
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const base64Foto = await fileToBase64(archivo);
  const url = `${BASE_URL}/fotoPerfil/usuarios/foto`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId, fotoPerfil: base64Foto }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.message || "Error al subir la foto" };
  }

  // 👇 Guarda el usuario actualizado en localStorage, si lo deseas
  if (data.user) {
    localStorage.setItem("servineo_user", JSON.stringify(data.user));
  }

  return data;
}

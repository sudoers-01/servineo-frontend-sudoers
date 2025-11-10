const BASE_URL = 'https://backdos.vercel.app';
const CLIENT_BASE = '/api/controlC/cliente';

export interface AuthProvider {
  provider: 'email' | 'google' | 'apple' | 'github';
  email?: string;
  token?: string;
}

interface APIResponse {
  success?: boolean;
  message?: string;
  client?: {
    authProviders: AuthProvider[];
  };
}

export async function obtenerMetodosCliente(): Promise<AuthProvider[]> {
  const token = localStorage.getItem("servineo_token");
  if (!token) throw new Error("No se encontró token de autenticación.");

  try {
    const res = await fetch(`${BASE_URL}${CLIENT_BASE}/profile`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });

    const data: APIResponse = await res.json().catch(() => ({ client: { authProviders: [] } }));

    if (!res.ok) throw new Error(data.message || "Error al cargar métodos de login.");

    return data.client?.authProviders || [];
  } catch (error) {
    console.error("Error obtenerMetodosCliente:", error);
    throw error;
  }
}

export async function desvincularMetodo(provider: string): Promise<AuthProvider[]> {
  const token = localStorage.getItem("servineo_token");
  if (!token) throw new Error("No se encontró token de autenticación.");

  try {
    const res = await fetch(`${BASE_URL}${CLIENT_BASE}/unlink`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ provider }),
    });

    const data: APIResponse = await res.json().catch(() => ({ client: { authProviders: [] } }));

    if (!res.ok) throw new Error(data.message || "Error al desvincular método.");

    return data.client?.authProviders || [];
  } catch (error) {
    console.error("Error desvincularMetodo:", error);
    throw error;
  }
}





const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('servineo_token');
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}/api/controlC/2fa${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any = {};
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    const error: any = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// -----------------------------
// GENERAR QR
// -----------------------------
export async function generateQr() {
  return fetchWithAuth('/generate', { method: 'POST' });
}

// -----------------------------
// VERIFICAR TOKEN (AQUÍ ERA EL CAMBIO IMPORTANTE)
// -----------------------------
export async function verifyToken(token: string) {
  try {
    return await fetchWithAuth('/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  } catch (err: any) {

    const status = err?.status;
    const data = err?.data || {};

    // ------------------------------------------------------
    // 💥 SI EL BACKEND INDICA BLOQUEO (423)
    // ------------------------------------------------------
    if (status === 423) {
      const e: any = new Error(data.message || "Cuenta bloqueada temporalmente.");
      e.locked = true;
      e.lockedUntil = data.lockedUntil;   // ISO string
      e.retryAfterSeconds = data.retryAfterSeconds;
      throw e;
    }

    // ------------------------------------------------------
    // ❌ TOKEN INCORRECTO, PERO NO BLOQUEADO (400)
    // Back devuelve:
    // { message: "Token inválido", attemptsLeft, attempts }
    // ------------------------------------------------------
    if (status === 400) {
      const e: any = new Error(data.message || "Token inválido");
      e.attemptsLeft = data.attemptsLeft;
      e.attempts = data.attempts;
      throw e;
    }

    // ------------------------------------------------------
    // ⚠️ Otros errores
    // ------------------------------------------------------
    const e: any = new Error(data.message || "Error verificando código");
    throw e;
  }
}

// -----------------------------
// DESHABILITAR 2FA
// -----------------------------
export async function disable2fa() {
  return fetchWithAuth('/disable', { method: 'POST' });
}
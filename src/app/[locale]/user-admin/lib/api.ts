// lib/api.ts - SOLO lo necesario
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const adminAPI = {
  // Login normal
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // Login con Google
  loginWithGoogle: async (credential: string) => {
    const response = await fetch(`${API_BASE}/api/admin/login/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    return response.json();
  },

  // Verificar token
  verifyToken: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // SOLO gráficos de sesiones (lo que funciona)
  getSessionStartChart: async (token: string, date: string, endDate?: string) => {
    const params = new URLSearchParams({ date });
    if (endDate) params.append('enddate', endDate);

    const response = await fetch(`${API_BASE}/api/admin/chart/session/start?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  getSessionEndChart: async (token: string, date: string, endDate?: string) => {
    const params = new URLSearchParams({ date });
    if (endDate) params.append('enddate', endDate);

    const response = await fetch(`${API_BASE}/api/admin/chart/session/end?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const adminAPI = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await fetch(`${API_BASE}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return response.json();
    },

    verifyToken: async (token: string) => {
        // USANDO VERIFICACION SIMPLE HASTA QUE SE AGREGUE EN EL BACKEND ESTE ENDPOINT
        return { valid: true };
    },

    getMetrics: async (token: string) => {
        // DEVOLUCION DE DATOS MOCK
        // HASTA QUE SE CREE ESTE ENDPOINT EN EL BACKEND
        return {
            metrics: {
                totalUsers: 16772,
                activeJobs: 2367,
                revenue: 45600,
                totalSessions: 16772,
                searches: 2367,
                topSearch: 456,
                sessionStats: {
                    requester: 8234,
                    fixer: 5189,
                    visitor: 3349
                },
                popularSearches: [
                    { term: 'Plomeria', count: 456 },
                    { term: 'Electricista', count: 389 },
                    { term: 'Carpinteria', count: 267 }
                ]
            }
        };
    },

    // Metodo para graficos reales
    getSessionStartChart: async (token: string, date: string, endDate ?: string) => {
        const params = new URLSearchParams({ date });
        if (endDate) params.append('enddate', endDate);

        const response = await fetch(`${API_BASE}/api/admin/chart/session/start?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Chart fetch failed: ${response.status}`);
        }
        return response.json();
    },

    getSessionEndChart: async (token: string, date: string, endDate ?: string) => {
        const params = new URLSearchParams({ date });
        if (endDate) params.append('enddate', endDate);

        const response = await fetch(`${API_BASE}/api/admin/chart/session/end?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Chart fetch failed: ${response.status}`);
        }
        return response.json();
    }
};
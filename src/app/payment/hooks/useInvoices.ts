//src/app/payment/hooks/useInvoices.ts
import { useState, useEffect, useCallback } from 'react';

// Define las interfaces de datos
interface Invoice {
    // Es crucial que esta interfaz refleje lo que tu API devuelve
    amount: number; // Monto principal del trabajo
    commissionAmount: number; // Comisión generada
    paymentDate: string; // Fecha y hora del pago (ISO string)
    fixerId: string; // ID del Fixer
    requesterId: string; // ID del Cliente
    totalFinal: number; // Monto total (amount + commission)
    currency: string; // Moneda (ej: 'BOB' o 'USD')
    status: string; // Estado (ej: 'succeeded', 'paid', 'pending')
    method?: string; 
    category?: string; 
    fixerName?: string;
    requesterName?: string;
}

// Estructura de la metadata para la paginación
interface Metadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Estructura de la respuesta completa del listado
interface InvoiceResponse {
    success: boolean;
    data: Invoice[];
    metadata: Metadata;
}

// Estructura para los filtros
interface Filters {
    search: string; // Búsqueda por ID, Fixer, Categoría
    startDate: string | null;
    endDate: string | null;
}

// URL base de tu API de backend (ajusta si es necesario)
const API_BASE_URL = 'http://localhost:4000/api/v1/invoices'; 

// --- ID DE PRUEBA PROPORCIONADO POR EL USUARIO ---
// Fixer ID usado para el listado por defecto: 60a5e8c1d5f2a1b9c7d4e3f3
const VALID_FIXER_ID = "60a5e8c1d5f2a1b9c7d4e3f3"; 
const DEFAULT_LIMIT = 10;

export const useInvoices = (fixerId: string = VALID_FIXER_ID) => {
    // --- ESTADOS PARA EL LISTADO ---
    const [limit, setLimit] = useState(DEFAULT_LIMIT);
    const [metadata, setMetadata] = useState<Metadata>({ total: 0, page: 1, limit: DEFAULT_LIMIT, totalPages: 0 }); 
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Filters>({ search: '', startDate: null, endDate: null });
    
    // --- ESTADOS COMUNES ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // FUNCIÓN DE UTILIDAD: Lógica de reintento para API calls (Robustez)
    const fetchWithRetries = useCallback(async (url: string) => {
        const maxRetries = 3;
        let lastResponse: Response | undefined;
        for (let i = 0; i < maxRetries; i++) {
            try {
                lastResponse = await fetch(url);
                if (lastResponse.ok) return lastResponse;
            } catch (e) {
                console.error(`Intento ${i + 1} fallido:`, e);
            }
            if (i < maxRetries - 1) {
                // Backoff exponencial: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
        return lastResponse; // Devuelve la última respuesta (que será un error)
    }, []);


    // Función para obtener el listado de facturas
    const fetchInvoices = useCallback(async () => {
        if (!fixerId) return;

        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams();
            // Paginación
            params.append('page', page.toString());
            params.append('limit', limit.toString()); // Usamos el estado 'limit'
            
            // Filtros de búsqueda (por ID, etc.)
            if (filters.search) {
                params.append('search', filters.search);
            }
            // Filtros de fecha
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            // ID del fixer
            params.append('fixerId', fixerId);

            const url = `${API_BASE_URL}?${params.toString()}`;
            console.log('🔍 Fetching Invoices List (Fixer ID:', fixerId, '):', url);

            const response = await fetchWithRetries(url);
            
            if (!response || !response.ok) {
                const errorBody = response ? await response.json().catch(() => ({ message: 'Error de formato desconocido' })) : { message: 'Fallo de red/servidor' };
                throw new Error(`Error ${response?.status || '500'}: Fallo al cargar las facturas. Mensaje: ${errorBody.message || 'Sin mensaje de error'}`);
            }

            const result: InvoiceResponse = await response.json();

            // Si es la página 1 O si se está aplicando un filtro, reemplazamos. 
            setInvoices(prev => page === 1 ? result.data : [...prev, ...result.data]);
            
            // Actualizamos la metadata (incluyendo el limit real usado)
            setMetadata({ ...result.metadata, limit });

        } catch (err) {
            console.error('❌ Fetch error:', err);
            setError((err as Error).message);
            setInvoices([]);
            setMetadata(prev => ({ ...prev, total: 0, page: page, totalPages: 0 })); 
        } finally {
            setLoading(false);
        }
    }, [page, filters, limit, fixerId, fetchWithRetries]); 

    // Función para obtener el Detalle de la Factura por ID
    const fetchInvoiceDetail = useCallback(async (id: string): Promise<Invoice | null> => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}/${id}`;
            console.log('🔍 Fetching detail (Invoice ID:', id, '):', url);

            const response = await fetchWithRetries(url);

            if (!response) {
                throw new Error('No se pudo establecer conexión para el detalle de la factura.');
            }
            
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Error de formato desconocido' }));
                throw new Error(`Error ${response.status}: Fallo al cargar el detalle. Mensaje: ${errorBody.message || 'Sin mensaje de error'}`);
            }

            const result: { data: Invoice } = await response.json(); // Asumo que el detalle viene envuelto en 'data'
            return result.data;

        } catch (err) {
            console.error('❌ Fetch detail error:', err);
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchWithRetries]);

    // ÚNICO useEffect para disparar el fetch del listado. 
    useEffect(() => {
        console.log(`📡 Disparando fetchInvoices. Page: ${page}, Limit: ${limit}, Search: ${filters.search}`);
        fetchInvoices();
    }, [page, filters, limit, fixerId, fetchInvoices]); 

    
    // Función para manejar el cambio de página (usada por "Load More")
    const handleNextPage = () => {
        if (page < metadata.totalPages) {
            setPage(prev => prev + 1);
        }
    };
    
    // Función para aplicar filtros (reset a página 1 y limpia la lista para evitar doble fetch)
    const applyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        
        if (page !== 1) {
            setPage(1); 
        }
        setInvoices([]); 
    };
      
    // Función para manejar la búsqueda instantánea
    const handleSearch = (searchTerm: string) => {
        applyFilters({ ...filters, search: searchTerm });
    };

    // Función para resetear la paginación y filtros
    const resetState = () => {
        setPage(1);
        setLimit(DEFAULT_LIMIT);
        setFilters({ search: '', startDate: null, endDate: null });
        setInvoices([]);
        setMetadata({ total: 0, page: 1, limit: DEFAULT_LIMIT, totalPages: 0 });
        setError(null);
    };

    return {
        invoices,
        metadata,
        loading,
        error,
        page,
        limit,
        filters,
        handleNextPage,
        applyFilters,
        handleSearch,
        fetchInvoiceDetail,
        setLimit,
        resetState,
    };
};
// src/app/payment/components/InvoiceList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    //DollarSign, 
    ChevronRight, 
    Search, 
    Loader2, 
    ArrowLeft, 
    ArrowDownUp, 
    Calendar,
    FileText,
    Users
} from 'lucide-react'; 

// --- Bloque de Router, Tipos y API (ACTUALIZADO para Express) ---

// Lógica para manejar el router en Next.js (o un mock si no está disponible)
interface AppRouter {
    push: (path: string) => void;
    back: () => void;
}
let useRouter: () => AppRouter;

try {
    // Intentar importar los hooks de Next.js
    // @ts-ignore
    ({ useRouter } = require('next/navigation'));
} catch (e) {
    // Usar mocks si la importación falla
    console.warn("Could not import Next.js navigation hooks. Using mock functions.");
    useRouter = () => ({ 
        push: (path: string) => console.log(`[MOCK PUSH] Navegando a: ${path}`),
        back: () => console.log('[MOCK BACK] Volviendo...'),
    });
}

// 1. INTERFAZ DE DATOS QUE DEVUELVE EL BACKEND DE EXPRESS
export interface BackendInvoice {
    id: string; // El _id de MongoDB
    transactionId: string;
    requesterName: string;
    date: string; // Fecha en formato YYYY-MM-DD
    total: number;
    currency: string;
    status: string;
    // Se añade para consistencia, aunque no se usa en el resumen
    requesterId: string; 
}

// 2. INTERFAZ DE FACTURA PARA LA VISTA (Para mantener la compatibilidad con tu JSX existente)
export interface Invoice {
    _id: string; 
    requesterId: string; // Añadido
    'Company Name': string; 
    'Tax ID': string; 
    'Requester Name': string; 
    'Job Type': string; 
    'Transaction ID': string; 
    Date: string; 
    'Payment Method': string; 
    Status: string;
    Subtotal: number; 
    Commission: number; 
    IVA: number; 
    Total: number; 
}

// URL base de nuestro Backend (Puerto 4000). **Verifica que este puerto sea correcto**
const API_URL = 'http://localhost:4000'; 


// 3. FUNCIÓN PARA OBTENER LAS FACTURAS DESDE EL BACKEND
const fetchInvoices = async (): Promise<Invoice[]> => {
    try {
        // Llamamos a la ruta de lista general de Express
        const response = await fetch(`${API_URL}/api/v1/invoices`);
        
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Response: ${errorBody}`);
        }
        
        // El body es { success: true, data: BackendInvoice[] }
        const { data: backendData } = await response.json();

        // 4. Mapear los datos del backend (BackendInvoice[]) a la estructura de la vista (Invoice[])
        const mappedInvoices: Invoice[] = (backendData as BackendInvoice[]).map(item => ({
            _id: item.id,
            'Transaction ID': item.transactionId,
            'Company Name': item.requesterName || 'N/A', 
            Date: item.date, 
            Total: item.total, 
            Status: item.status, 
            requesterId: item.requesterId || item.id, // Usar el requesterId real
            
            // Campos que no existen en el summary del backend o son placeholders
            'Tax ID': 'N/A', 
            'Requester Name': item.requesterName || 'N/A',
            'Job Type': 'Pago General', 
            'Payment Method': 'Desconocido',
            Subtotal: (item.total || 0), 
            Commission: 0, 
            IVA: 0,
        }));

        return mappedInvoices;

    } catch (error) {
        console.error("Error al obtener facturas desde el backend:", error);
        return [];
    }
};

// --- Componente principal ---

const InvoiceList = () => {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc'); 
    
    // Función auxiliar para convertir ISO Date string a Date object
    const parseDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? new Date(0) : date;
        } catch (e) {
            return new Date(0);
        }
    };

    // EFECTO PARA CARGAR LAS FACTURAS REALES
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            
            const data = await fetchInvoices();
            
            // Ordenar los datos recibidos (más reciente primero por defecto)
            const sorted = [...data].sort((a, b) => {
                return parseDate(b.Date).getTime() - parseDate(a.Date).getTime();
            });

            setInvoices(sorted);
            setLoading(false);
        };

        loadData();
    }, []);

    // Función para cambiar la dirección de ordenamiento
    const toggleSortDirection = useCallback(() => {
        setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    }, []);

    // Función para formatear fechas a DD/MM/AAAA
    const formatDate = (isoDate: string) => {
        const date = parseDate(isoDate);
        if (date.getTime() === 0) return "Fecha Inválida";
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    };


    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---

    // 1. Aplicar filtrado por búsqueda
    const searchedInvoices = invoices.filter(invoice => {
        const clientName = invoice['Company Name'] || '';
        const jobType = invoice['Job Type'] || '';
        const transactionId = invoice['Transaction ID'] || '';

        const query = searchQuery.toLowerCase();
        
        return (
            clientName.toLowerCase().includes(query) ||
            jobType.toLowerCase().includes(query) ||
            transactionId.includes(query)
        );
    });

    // 2. Aplicar ordenamiento a los resultados filtrados
    const finalFilteredInvoices = [...searchedInvoices].sort((a, b) => {
        const dateA = parseDate(a.Date).getTime();
        const dateB = parseDate(b.Date).getTime();

        if (sortDirection === 'desc') {
            return dateB - dateA; // Más reciente (B) primero
        } else {
            return dateA - dateB; // Más antigua (A) primero
        }
    });

    // Función que maneja el clic y navega a la vista de detalle
    const handleInvoiceClick = (invoiceId: string) => {
        // Redirige a la ruta de detalle (ej: /detalleFactura/65502...)
        router.push(`/detalleFactura/${invoiceId}`); 
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <Loader2 className="animate-spin text-indigo-600 mx-auto" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
                
                {/* Header con título y botón de Volver */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-800">Facturación Reciente</h1>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
                        title="Volver a la página anterior"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Volver
                    </button>
                </div>

                <div className="mb-8">
                    {/* Controles de Búsqueda y Ordenamiento */}
                    <div className="flex space-x-3 mb-6">
                        {/* Barra de Búsqueda */}
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Buscar cliente, servicio o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-inner text-sm"
                            />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        
                        {/* Botón de Ordenar por Fecha */}
                        <button 
                            onClick={toggleSortDirection}
                            className={`flex items-center justify-center font-bold text-sm px-4 rounded-xl transition-all duration-300 flex-shrink-0 shadow-md ${
                                sortDirection === 'desc' 
                                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                                    : 'bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title={`Ordenar por fecha: ${sortDirection === 'desc' ? 'Más recientes primero' : 'Más antiguas primero'}`}
                        >
                            <ArrowDownUp className={`w-4 h-4 mr-2 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : 'rotate-0'}`} />
                            Fecha
                        </button>
                    </div>
                </div>

                {/* Lista de Facturas */}
                <div className="space-y-4">
                    {finalFilteredInvoices.length > 0 ? (
                        finalFilteredInvoices.map((invoice) => (
                            <button
                                // Usamos el _id de MongoDB (invoice._id) que es el ID de la factura
                                key={invoice._id} 
                                onClick={() => handleInvoiceClick(invoice._id)}
                                className="w-full text-left bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                            >
                                <div className="flex justify-between items-center">
                                    {/* SECCIÓN IZQUIERDA: Detalles de la Factura */}
                                    <div className="p-4 flex-grow border-r border-dashed border-gray-200">
                                        
                                        {/* Cliente y Servicio (Título principal) */}
                                        <div className="flex items-center mb-1">
                                            <Users className="w-5 h-5 text-indigo-500 mr-2" />
                                            {/* Mapeamos 'Company Name' al nombre del cliente */}
                                            <h4 className="font-bold text-lg text-gray-800 truncate">{invoice['Company Name']}</h4>
                                        </div>
                                        {/* Mapeamos 'Job Type' al servicio */}
                                        <p className="text-sm text-gray-600 mb-2 ml-7 leading-tight">{invoice['Job Type']}</p>
                                        
                                        {/* Información Secundaria (Fecha e ID) */}
                                        <div className="flex items-center text-xs text-gray-500 mt-2 gap-4 ml-7">
                                            <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {/* Usamos la función de formateo para mostrar la fecha */}
                                                {formatDate(invoice.Date)}
                                            </span>
                                            <span className="flex items-center">
                                                <FileText className="w-3 h-3 mr-1 text-gray-400" />
                                                {/* Usamos 'Transaction ID' como el ID de la factura visible */}
                                                ID: {invoice['Transaction ID']}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* SECCIÓN DERECHA: Monto y Acción (Visualización del Dinero) */}
                                    <div className="p-4 flex-shrink-0 flex items-center gap-4">
                                        
                                        {/* Chip del Monto */}
                                        <div className="text-right flex flex-col items-center">
                                            <div className="flex items-center bg-emerald-100 text-emerald-700 font-extrabold py-2 px-4 rounded-full shadow-inner transform scale-95">
                                               
                                                <span className="text-xl">
                                                    {/* CORRECCIÓN APLICADA: Usa ?? 0 para manejar valores undefined/null */}
                                                    {(invoice.Total ?? 0).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <span className="text-xs text-emerald-600 font-semibold mt-1">
                                                Bs.
                                            </span>
                                        </div>
                                        
                                        {/* Flecha de Navegación */}
                                        <ChevronRight className="text-indigo-400 group-hover:text-indigo-600 transition-colors w-6 h-6" />
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">No se encontraron facturas con esa búsqueda.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default InvoiceList;
//src/app/payment/components/invoiceList
import React, { useState, useEffect } from 'react';

import { DollarSign, ChevronRight, Search, Loader2, ArrowLeft, Filter, ArrowDownUp } from 'lucide-react'; // Importar ArrowDownUp

// --- Bloque de Router, Tipos y Mocks ---
// Lógica para manejar el router en Next.js (o un mock si no está disponible)
interface AppRouter {
    push: (path: string) => void;
    back: () => void;
}
let useRouter: () => AppRouter;

try {
    // Intentar importar los hooks de Next.js
    ({ useRouter } = require('next/navigation'));
} catch (e) {
    // Usar mocks si la importación falla (útil fuera del entorno Next.js completo)
    console.warn("Could not import Next.js navigation hooks. Using mock functions.");
    useRouter = () => ({ 
        push: (path: string) => alert(`[MOCK PUSH] Navegando a: ${path}`),
        back: () => alert('[MOCK BACK] Volviendo...'),
    });
}
// Tipo de dato para una factura en el listado
interface Invoice {
    id: string; clientName: string; service: string; amount: number; date: string;
}
// Datos de ejemplo para simular la carga
const mockInvoices: Invoice[] = [
    { id: 'mock-0', clientName: 'Cliente Mock 55', service: 'Electricidad', amount: 569.80, date: '08/11/2025' },
    { id: 'mock-1', clientName: 'Cliente Mock 54', service: 'Plomería', amount: 56.10, date: '08/11/2025' },
    { id: 'mock-2', clientName: 'Cliente Mock 53', service: 'Electricidad', amount: 229.90, date: '07/11/2025' },
    { id: 'mock-3', clientName: 'Cliente Mock 52', service: 'Plomería', amount: 155.10, date: '07/11/2025' },
    { id: 'mock-4', clientName: 'Cliente Mock 51', service: 'Carpintería', amount: 840.00, date: '06/11/2025' },
];
// ------------------------------------------

const InvoiceList = () => {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    // Estado para la dirección de ordenamiento: 'desc' (más reciente) por defecto
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc'); 
    
    // Función auxiliar para convertir DD/MM/AAAA a un objeto Date
    const parseDate = (dateString: string) => {
        const [day, month, year] = dateString.split('/').map(Number);
        // Usa YYYY-MM-DD para evitar problemas de zona horaria, Month es 0-index
        return new Date(year, month - 1, day); 
    };

    // Efecto para cargar los mocks inicialmente
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            // Ordenar los mockInvoices por fecha al cargarlos (más reciente primero)
            const sorted = [...mockInvoices].sort((a, b) => {
                return parseDate(b.date).getTime() - parseDate(a.date).getTime();
            });
            setInvoices(sorted);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Función para cambiar la dirección de ordenamiento
    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    // 1. Aplicar filtrado por búsqueda
    const searchedInvoices = invoices.filter(invoice => 
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.includes(searchQuery)
    );

    // 2. Aplicar ordenamiento a los resultados filtrados
    const finalFilteredInvoices = [...searchedInvoices].sort((a, b) => {
        const dateA = parseDate(a.date).getTime();
        const dateB = parseDate(b.date).getTime();

        if (sortDirection === 'desc') {
            return dateB - dateA; // Más reciente (B) primero
        } else {
            return dateA - dateB; // Más antigua (A) primero
        }
    });

    // 🚨 CORRECCIÓN CLAVE: Redirigir a la nueva ruta /detalleFactura
    const handleInvoiceClick = (invoiceId: string) => {
        // Antes estaba: router.push(`/facturas/${invoiceId}`); 
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
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
                
                {/* Header con título y botón de Volver */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Facturación</h1>
                    {/* El botón de Volver usa router.back() */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Volver
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">RESUMEN DE PAGOS</h2>
                    
                    <div className="flex space-x-3 mb-6">
                         {/* Barra de Búsqueda */}
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Buscar cliente, servicio o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                            />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        
                        {/* Botón de Ordenar por Fecha */}
                        <button 
                            onClick={toggleSortDirection}
                            className="flex items-center justify-center bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 rounded-xl transition-colors flex-shrink-0 shadow-sm"
                            title={`Ordenar por fecha: ${sortDirection === 'desc' ? 'Más antiguas primero' : 'Más recientes primero'}`}
                        >
                            <ArrowDownUp className={`w-4 h-4 mr-1 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : 'rotate-0'}`} />
                            {sortDirection === 'desc' ? 'Recientes' : 'Antiguas'}
                        </button>

                    </div>
                </div>

                {/* Lista de Facturas */}
                <div className="space-y-4">
                    {finalFilteredInvoices.length > 0 ? (
                        finalFilteredInvoices.map((invoice) => (
                            <button
                                key={invoice.id}
                                onClick={() => handleInvoiceClick(invoice.id)}
                                className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <div className="flex items-center gap-4">
                                     {/* Icono de dólar */}
                                    <div className="bg-green-50 text-green-600 p-3 rounded-full flex-shrink-0">
                                        $
                                    </div>
                                    <div className='flex flex-col'>
                                        <h4 className="font-semibold text-gray-800">{invoice.clientName}</h4>
                                        <p className="text-sm text-gray-500 leading-tight">{invoice.service}</p>
                                        <p className="text-xs text-indigo-400">ID: {invoice.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="font-bold text-indigo-600 text-lg">Bs. {invoice.amount.toFixed(2).replace('.', ',')}</p>
                                        <p className="text-xs text-gray-500">{invoice.date}</p>
                                    </div>
                                     {/* El botón > que lleva al detalle */}
                                    <ChevronRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" size={20} />
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
// src/app/lib/types.ts

/*// Definición de tipos para la simulación de datos de la factura
export interface InvoiceDetailData {
    id: string;
    date: string; // Formato DD/MM/AAAA (ej. 08/11/2025)
    status: 'PAID' | 'PENDING';
    method: string;
    jobAmount: number;
    commission: number;
    total: number;
    currency: string;
    fixerId: string;
    requesterId: string;
    jobId: string;
}*/
// src/app/lib/types.ts

// Interfaces de tipos de datos

// 1. Interfaz para cada artículo en la factura
export interface DetailItem {
    description: string;
    amount: number;
}

// 2. Interfaz para los datos completos de la factura
export interface InvoiceDetailData {
    id: string;
    requesterId: string;
    date: string;
    time: string;
    amount: number;
    currency: string;
    status: 'PAID' | 'PENDING' | 'CANCELLED';
    paymentMethod: string;
    jobId: string;
    jobAmount: number; 
    commission: number;
    items: DetailItem[]; // La lista de artículos
}

// 3. Props para el componente InvoiceDetail
export interface InvoiceDetailProps {
    invoice: InvoiceDetailData;
}

// 4. Props para la página dinámica de Next.js
export interface InvoicePageProps {
    params: {
        invoiceId: string;
    };
}
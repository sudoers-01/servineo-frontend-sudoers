'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importamos useRouter para navegar
import InvoiceDetail from '@/app/payment/components/InvoiceDetail';
import type { InvoiceDetailData } from '@/app/lib/types'; 


// Definición local de la interfaz de ruta (la mejor práctica para PageProps)
interface PageProps {
  params: {
    invoiceId: string;
  };
}


// Función de simulación para cargar la factura
const fetchInvoice = async (id: string): Promise<InvoiceDetailData> => {
  // Simulación de una llamada a API
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
  // Datos de ejemplo que cumplen con la interfaz InvoiceDetailData importada
  return {
    id: id,
    requesterId: 'USR-7890',
    date: '2025-11-09',
    time: '18:50',
    amount: 1550.75,
    currency: 'USD',
    status: 'PAID',
    paymentMethod: 'Tarjeta de Crédito',
    jobId: 'JOB-456',
    jobAmount: 1600.00,
    commission: 49.25,
    items: [ 
      { description: 'Diseño Web e Integración', amount: 1200.00 },
      { description: 'Hosting y Dominio (1 año)', amount: 400.00 }
    ]
  } as InvoiceDetailData; 
};


const InvoiceDetailPage: React.FC<PageProps> = ({ params }) => {
  // Inicializamos el router
  const router = useRouter(); 
  
  // Acceso directo a params (aceptamos la advertencia de Next.js 15)
  const { invoiceId } = params;

  const [invoice, setInvoice] = useState<InvoiceDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await fetchInvoice(invoiceId);
        setInvoice(data);
      } catch (error) {
        console.error('Error al cargar la factura:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId]);

  if (isLoading) {
    return (
      // Indicador de carga
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Cargando detalles de la factura...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      // Mensaje de error si no hay factura
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-red-500 font-bold">Error: Factura no encontrada.</p>
      </div>
    );
  }

  // Define la ruta a la que quieres volver (AJUSTA ESTA RUTA)
  const handleGoBack = () => {
    router.push('/facturas'); // <--- ¡CAMBIA ESTA RUTA!
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* BOTÓN VOLVER AL LISTADO */}
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver al Listado
        </button>
        
        <InvoiceDetail invoice={invoice} /> 
      </div>
    </main>
  );
};

export default InvoiceDetailPage;
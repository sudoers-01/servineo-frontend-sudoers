//src/app/detalleFactura/[invoicedId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import InvoiceDetail, { InvoiceDetailData } from '../../../Components/payment/InvoiceDetail';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Función auxiliar para obtener el ID del usuario, duplicada de InvoiceList.tsx
const getRequesterId = () => {
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('servineo_user') : null;
    if (userJson) {
        try {
            const userData = JSON.parse(userJson);
            return userData.id;
        } catch (e) {
            console.error("Error al parsear datos de usuario:", e);
            return null;
        }
    }
    return null;
};

const InvoiceDetailPage: React.FC = () => {
  const params = useParams();
  const invoiceId = params?.invoiceId as string;
  const [invoiceData, setInvoiceData] = useState<InvoiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;

    const requesterId = getRequesterId(); // Obtener el ID del usuario

    if (!requesterId) {
      console.error("No se encontró el ID del usuario. Acceso denegado.");
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        // CAMBIO CLAVE: Agregar requesterId al query string para la verificación de propiedad
        const res = await fetch(`${API_URL}/api/v1/invoices/${invoiceId}?requesterId=${requesterId}`); 
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const { data } = await res.json();
        setInvoiceData(data);
      } catch (err) {
        console.error('Error de red al consultar backend:', err);
        setInvoiceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">Cargando factura...</p>
      </main>
    );
  }

  if (!invoiceData) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center text-center bg-gray-50 p-4 sm:p-8">
        <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-xl font-semibold text-gray-800">Factura no encontrada o Acceso Denegado</p>
        <p className="mt-2 text-gray-600">ID: {invoiceId}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Volver
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <InvoiceDetail invoice={invoiceData} />
    </main>
  );
};

export default InvoiceDetailPage
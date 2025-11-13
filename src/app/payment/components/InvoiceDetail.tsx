// src/app/payment/components/InvoiceDetail.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDetailData {
  id: string;
  clientName: string;
  clientAddress: string;
  clientVAT: string;
  service: string;
  date: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  items: InvoiceItem[];
}

interface InvoiceDetailProps {
  invoice: InvoiceDetailData;
  onBack?: () => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onBack }) => {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Generar QR al montar
  useEffect(() => {
    const generateQr = async () => {
      const qrValue = `Factura ID: ${invoice.id} | Cliente: ${invoice.clientName} | Total: Bs. ${invoice.totalAmount ?? 0}`;
      const dataUrl = await QRCode.toDataURL(qrValue, { width: 120, margin: 1 });
      setQrDataUrl(dataUrl);
    };
    generateQr();
  }, [invoice]);

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-bold">Factura no encontrada.</p>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      let y = 10;

      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(63, 81, 181);
      doc.text(`Factura #${invoice.id}`, 10, y);
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha: ${invoice.date}`, 10, y);
      y += 8;
      doc.text(`Cliente: ${invoice.clientName}`, 10, y);
      y += 6;
      doc.text(`Dirección: ${invoice.clientAddress}`, 10, y);
      y += 6;
      doc.text(`RUC/VAT: ${invoice.clientVAT}`, 10, y);
      y += 6;
      doc.text(`Servicio: ${invoice.service}`, 10, y);
      y += 10;

      // Tabla de ítems
      doc.text('Ítems:', 10, y);
      y += 6;
      invoice.items.forEach((item, idx) => {
        doc.text(
          `${idx + 1}. ${item.description} | Cant: ${item.quantity ?? 0} | P.Unit: ${(item.unitPrice ?? 0).toFixed(
            2
          )} | Total: ${(item.total ?? 0).toFixed(2)}`,
          10,
          y
        );
        y += 7;
      });

      y += 5;
      doc.text(`Subtotal: Bs. ${(invoice.subtotal ?? 0).toFixed(2)}`, 10, y);
      y += 6;
      doc.text(`Impuestos (${((invoice.taxRate ?? 0) * 100).toFixed(0)}%): Bs. ${(invoice.taxAmount ?? 0).toFixed(2)}`, 10, y);
      y += 6;
      doc.setTextColor(63, 81, 181);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: Bs. ${(invoice.totalAmount ?? 0).toFixed(2)}`, 10, y);

      // Agregar QR si ya se generó
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 150, 10, 50, 50);
      }

      doc.save(`Factura_${invoice.id}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <button
            onClick={onBack || (() => router.back())}
            className="flex items-center text-sm font-semibold hover:text-indigo-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Volver
          </button>
          <h1 className="text-2xl font-extrabold">Detalle de Factura</h1>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl shadow-lg hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Descargar PDF
              </>
            )}
          </button>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-8">
          {/* Encabezado de Factura */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <p className="text-sm text-gray-200">Factura Número</p>
              <p className="text-3xl font-black text-white bg-indigo-600 inline-block px-3 py-1 rounded">{invoice.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-200">Fecha de Emisión</p>
              <p className="text-lg font-semibold text-gray-700">{invoice.date}</p>
            </div>
          </div>

          {/* Datos Cliente y Servicio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-indigo-600 mb-2">Cliente</h3>
              <p className="font-semibold">{invoice.clientName}</p>
              <p className="text-sm text-gray-600">{invoice.clientAddress}</p>
              <p className="text-sm text-gray-600">RUC/VAT: {invoice.clientVAT}</p>
            </div>
            <div>
              <h3 className="font-bold text-indigo-600 mb-2">Servicio</h3>
              <p className="font-semibold">{invoice.service}</p>
            </div>
          </div>

          {/* Tabla de ítems */}
          <div>
            <h3 className="font-bold text-indigo-600 mb-4">Detalle de Cargos</h3>
            <div className="overflow-x-auto rounded-xl shadow-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-indigo-100 border-b border-indigo-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-indigo-600 uppercase tracking-wider">Cant.</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-indigo-600 uppercase tracking-wider">P. Unit. (Bs.)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-indigo-600 uppercase tracking-wider">Total (Bs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{item.quantity ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{(item.unitPrice ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900">{(item.total ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales y QR */}
          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-80 space-y-3 p-4 bg-indigo-50 rounded-xl shadow-inner">
              <div className="flex justify-between">
                <span className="text-indigo-600 font-semibold">Subtotal:</span>
                <span className="font-medium">{(invoice.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600 font-semibold">Impuestos ({((invoice.taxRate ?? 0) * 100).toFixed(0)}%)</span>
                <span className="font-medium">{(invoice.taxAmount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 border-indigo-200">
                <span className="text-xl font-extrabold text-indigo-600">TOTAL:</span>
                <span className="text-xl font-extrabold text-indigo-600">{(invoice.totalAmount ?? 0).toFixed(2)}</span>
              </div>

              {qrDataUrl && (
                <div className="mt-4 flex justify-center">
                  <img src={qrDataUrl} alt="QR Factura" width={120} height={120} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;

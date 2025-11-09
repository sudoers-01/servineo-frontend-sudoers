//src/app/lib/invoiceTemplate.ts
// src/app/lib/invoiceTemplate.ts

// Asegúrate de que tu archivo de plantilla luce similar a esto:
import { InvoiceDetailData } from '@/app/lib/types'; 

const formatCurrency = (amount: number, currency: string) => {
    // Lógica para formatear la moneda
    return `${currency} ${amount.toFixed(2).replace('.', ',')}`;
};

export function generateInvoiceHtml(invoice: InvoiceDetailData): string {
    // ... tu lógica de HTML aquí ...
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura ${invoice.id}</title>
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; font-size: 10pt; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); line-height: 18pt; color: #555; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .details table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; margin-bottom: 20px; }
        .details table td { padding: 5px; vertical-align: top; }
        .details table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
        .details table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
        .status { padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; text-align: center; }
        .status-paid { background-color: #10B981; } /* Emerald */
        .status-pending { background-color: #FBBF24; } /* Amber */
        .total-box { margin-top: 20px; padding: 15px; background-color: #EEF2FF; border-radius: 8px; text-align: right; }
        .total-box .label { font-size: 12pt; font-weight: 600; color: #4F46E5; }
        .total-box .amount { font-size: 20pt; font-weight: 900; color: #1E3A8A; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div>
                <h1 style="color: #4F46E5;">Servineo</h1>
                <p style="font-size: 10pt;">Comprobante de Pago</p>
            </div>
            <div style="text-align: right;">
                <div class="status ${invoice.status === 'PAID' ? 'status-paid' : 'status-pending'}">
                    ${invoice.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                </div>
                <br>
                Factura ID: ${invoice.id}<br>
                Fecha: ${invoice.date}
            </div>
        </div>

        <div class="details">
            <table>
                <tr class="heading">
                    <td>Concepto</td>
                    <td style="text-align: right;">Monto</td>
                </tr>
                <tr>
                    <td>Monto del Trabajo (Job ID: ${invoice.jobId})</td>
                    <td style="text-align: right;">${formatCurrency(invoice.jobAmount, invoice.currency)}</td>
                </tr>
                <tr>
                    <td>Comisión por Servicio (10%)</td>
                    <td style="text-align: right;">+ ${formatCurrency(invoice.commission, invoice.currency)}</td>
                </tr>
            </table>
        </div>

        <div class="total-box">
            <div class="label">TOTAL FINAL</div>
            <div class="amount">${formatCurrency(invoice.total, invoice.currency)}</div>
        </div>
        
        <p style="text-align: center; font-size: 8pt; color: #9CA3AF; margin-top: 40px;">
            Este comprobante es generado automáticamente por Servineo.<br>
            Gracias por utilizar nuestros servicios.
        </p>
    </div>
</body>
</html>`;
}
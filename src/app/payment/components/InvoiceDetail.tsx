import React, { useCallback, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { 
    InvoiceDetailProps, 
} from '@/app/lib/types'; 

// Importar dinámicamente las librerías del navegador para evitar errores SSR
let html2canvas: any;
let jsPDF: any;

if (typeof window !== 'undefined') {
    try {
        // @ts-ignore
        html2canvas = require('html2canvas');
        // @ts-ignore
        jsPDF = require('jspdf').jsPDF;
    } catch (e) {
        console.warn("Librerías html2canvas/jspdf no cargadas. La descarga de PDF puede fallar si no están instaladas.");
    }
}


// Componente auxiliar para las filas de detalle
const DetailRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-200 py-2">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-semibold text-gray-800">{value}</span>
    </div>
);


// Componente auxiliar StatusBadge
const StatusBadge: React.FC<{ status: 'PAID' | 'PENDING' | 'CANCELLED' }> = ({ status }) => {
    let colorClass = '';
    let text = '';
    switch (status) {
        case 'PAID':
            colorClass = 'bg-green-100 text-green-700';
            text = 'Pagado';
            break;
        case 'PENDING':
            colorClass = 'bg-yellow-100 text-yellow-700';
            text = 'Pendiente';
            break;
        case 'CANCELLED':
            colorClass = 'bg-red-100 text-red-700';
            text = 'Cancelado';
            break;
        default:
             colorClass = 'bg-gray-100 text-gray-700';
            text = 'Desconocido';
    }
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${colorClass}`}>
            {text}
        </span>
    );
};


const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    
    const { 
        id, 
        requesterId, 
        date, 
        time, 
        amount, 
        currency, 
        status, 
        paymentMethod,
        jobId,
        jobAmount,
        commission,
        items 
    } = invoice;

    // Lógica para descargar el PDF
    const handleDownloadPDF = useCallback(async () => {
        if (!html2canvas || !jsPDF) {
            console.error("No se pudo descargar: las librerías 'html2canvas' o 'jspdf' no están disponibles.");
            alert('Error: La función de descarga requiere las librerías html2canvas y jspdf. ¡Instálalas!');
            return;
        }

        setIsDownloading(true);

        // 1. Obtener la tarjeta que queremos imprimir
        const originalInput = document.getElementById('invoice-card'); 

        if (!originalInput) {
            setIsDownloading(false);
            alert('Error: No se encontró el elemento de la factura.');
            return;
        }

        // 2. Clonar el elemento (incluye todos los estilos de Tailwind)
        const clonedInput = originalInput.cloneNode(true) as HTMLElement;

        // 3. Crear un contenedor temporal, AISLADO y con fondo blanco garantizado.
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '-9999px'; // Lo sacamos de la vista
        tempContainer.style.backgroundColor = '#ffffff'; // CLAVE: Garantizamos un fondo blanco simple
        tempContainer.style.width = originalInput.offsetWidth + 'px'; // Mantenemos el ancho original

        // 4. Agregar el clon al contenedor temporal y el contenedor al body
        tempContainer.appendChild(clonedInput);
        document.body.appendChild(tempContainer);
        
        let canvas: HTMLCanvasElement;
        
        try {
            // 5. Capturar el HTML CLONADO dentro del contenedor simple
            // El color de fondo aquí es crucial: debe ser simple.
            canvas = await html2canvas(clonedInput, {
                scale: 2, 
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff', 
            });

            // 6. Resto del proceso PDF (sin cambios)
            const imgData = canvas.toDataURL('image/png');  
            const pdf = new jsPDF('p', 'mm', 'a4'); 
            
            const imgWidth = 210; 
            const pageHeight = 295; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Comprobante_${id}.pdf`);
            
        } catch (error) {
            console.error("Error al generar o descargar el PDF:", error);
            // El error 'lab' debería aparecer aquí en la consola
            alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
        } finally {
            // 9. Limpiar: remover el contenedor temporal del DOM
            document.body.removeChild(tempContainer);
        }

        setIsDownloading(false);
    }, [id, requesterId, date, time, amount, currency, status, paymentMethod, jobId, jobAmount, commission, items]);


    return (
        // Estilos robustos
        <div id="invoice-card" className="bg-white rounded-xl shadow-md p-6 sm:p-10 font-sans">
            <header className="border-b border-gray-300 pb-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        Detalle de Comprobante
                    </h1>
                    <StatusBadge status={status} />
                </div>
                <p className="text-sm text-gray-500 mt-1">Factura ID: <span className="font-mono text-gray-700">{id}</span></p>
            </header>

            {/* Información principal y cliente */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Cliente/a</h3>
                    <p className="font-medium text-gray-800">Cliente desconocido</p>
                    <p className="text-sm text-gray-500">Solicitante ID: <span className="font-mono text-gray-700">{requesterId}</span></p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Fecha y Hora</h3>
                    <p className="font-medium text-gray-800">{date}</p>
                    <p className="text-sm text-gray-500">{time}</p>
                </div>
            </div>

            {/* Tabla de Artículos (si existe) */}
            {items && items.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-2">Artículos del Servicio</h3>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-700">
                                <span className="font-normal">{item.description}</span>
                                <span className="font-medium">{item.amount.toFixed(2)} {currency}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Total */}
            <div className="flex justify-between border-t border-gray-300 pt-3 mb-8">
                <span className="text-xl font-bold text-gray-900">Total Facturado</span>
                <span className="text-xl font-bold text-gray-900">{amount.toFixed(2)} {currency}</span>
            </div>


            {/* Detalles Adicionales */}
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-2">Detalles de Transacción</h3>
            <div className="space-y-4">
                <DetailRow label="ID de Solicitud" value={requesterId} />
                <DetailRow label="Método de Pago" value={paymentMethod} />
                <DetailRow label="ID de Trabajo" value={jobId} />
                <DetailRow label="Monto del Trabajo" value={`${jobAmount.toFixed(2)} ${currency}`} />
                <DetailRow label="Comisión" value={`${commission.toFixed(2)} ${currency}`} />
            </div>

            {/* Botón de Descarga */}
            <div className="mt-10 text-center">
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center justify-center mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generando PDF...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5 mr-2" />
                            Descargar PDF
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InvoiceDetail;
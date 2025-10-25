"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BackButton from "../components/BackButton";

type PaymentStatus = "pending" | "under_review" | "confirmed" | "rejected" | "expired";

export default function QRPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Leer parámetros de la URL
  const trabajoId = searchParams.get('trabajoId');
  const bookingId = searchParams.get('bookingId') || 'N/A';
  const providerId = searchParams.get('providerId') || 'DEMO-PROVIDER';
  const amount = Number(searchParams.get('amount')) || 0;
  const currency = searchParams.get('currency') || 'BOB';

  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');

  // Generar referencia de pago simulada
  useEffect(() => {
    const ref = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setPaymentReference(ref);
    console.log('📋 Pago QR generado:', { trabajoId, bookingId, amount, ref });
  }, [trabajoId, bookingId, amount]);

  // Helper para formatear moneda
  const money = (n: number) =>
    n.toLocaleString("es-BO", { style: "currency", currency });

  // Calcular subtotal y comisión (3%)
  const commission = Math.round(amount * 0.03);
  const subtotal = amount - commission;

  // Simulador de pago completado
  const handleSimulatePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setStatus('confirmed');
      setLoading(false);

      // Guardar en localStorage para actualizar la demo
      if (trabajoId) {
        localStorage.setItem('last-paid-trabajo', trabajoId);

        // Disparar evento personalizado
        window.dispatchEvent(
          new CustomEvent('qr-payment-complete', {
            detail: { trabajoId: Number(trabajoId) }
          })
        );
      }

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/'); // Redirige a la página principal (demo)
      }, 2000);
    }, 2000);
  };

  // QR fallback
  const fallbackQR = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `REF:${paymentReference}|MONTO:${amount}${currency}|TRABAJO:${trabajoId}`
  )}`;

  return (
    // Fondo claro (principal): #F9FAFB
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      {/* Primary (Main Blue): #2B31E0, Texto: #F9FAFB */}
      <header className="bg-[#2B31E0]">
        <div className="max-w-5xl px-6 py-6">
          {/* Roboto Bold */}
          <h1 className="text-5xl font-bold text-[#F9FAFB]">Pagos con QR</h1>
        </div>
      </header>

      {/* BackButton usa sus propios estilos, asumimos que se alinea */}
      <BackButton fallback="/" className="fixed bottom-4 right-4 z-50" />

      <main className="max-w-5xl mx-auto p-6">
        {/* Alert de estado */}
        {status === 'confirmed' && (
          // Éxito: #16A34A
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-[#16A34A] rounded">
            <p className="text-green-800 font-semibold">
              ✅ Pago confirmado exitosamente. Redirigiendo...
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Información de pago */}
          <section>
            {/* Texto principal (oscuro): #111827, Roboto Bold */}
            <h2 className="text-4xl font-bold mb-3 text-[#111827]">
              Información de pago
            </h2>

            <div className="my-2">
              {/* Primary Medium: #2B6AE0 para línea destacada */}
              <hr className="w-full border-t-2 border-[#2B6AE0]" />
            </div>

            {/* Texto principal (oscuro): #111827 */}
            <dl className="space-y-6 text-[#111827] mt-6">
              {/* Trabajo ID */}
              <div className="flex justify-between items-center">
                {/* Roboto Medium */}
                <dt className="text-2xl font-medium">ID Trabajo:</dt>
                {/* Highlight (Azul suave): #759AE0 como color de realce */}
                <dd className="text-2xl font-semibold text-[#759AE0]">
                  #{trabajoId || 'N/A'}
                </dd>
              </div>

              {/* Destinatario */}
              <div className="flex justify-between items-center">
                <dt className="text-2xl font-medium">Destinatario:</dt>
                <dd className="text-2xl">Servineo Demo</dd>
              </div>

              {/* Número de Transacción */}
              <div className="flex justify-between items-start">
                <dt className="text-2xl font-medium whitespace-nowrap mr-4">
                  N° de Transacción:
                </dt>
                {/* Usar texto principal oscuro para buena legibilidad */}
                <dd className="text-xl text-right break-all font-mono text-[#111827]">
                  {paymentReference}
                </dd>
              </div>

              <div className="my-4">
                {/* Borde: #D1D5DB */}
                <hr className="w-full border-t border-[#D1D5DB]" />
              </div>

              {/* Sub Total */}
              <div className="flex justify-between items-center">
                <dt className="text-2xl font-medium">Sub Total:</dt>
                <dd className="text-2xl">{money(subtotal)}</dd>
              </div>

              {/* Comisión */}
              <div className="flex justify-between items-center">
                <dt className="text-2xl font-medium">Comisión (3%):</dt>
                <dd className="text-2xl">{money(commission)}</dd>
              </div>

              <div className="my-4">
                {/* Primary Medium: #2B6AE0 */}
                <hr className="w-full border-t-2 border-[#2B6AE0]" />
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <dt className="text-2xl font-semibold">Total:</dt>
                {/* Primary Medium: #2B6AE0 para destacar el total */}
                <dd className="text-3xl font-bold text-[#2B6AE0]">
                  {money(amount)}
                </dd>
              </div>

              <div className="my-6">
                {/* Primary Medium: #2B6AE0 */}
                <hr className="w-full border-t-2 border-[#2B6AE0]" />
              </div>

              {/* Estado */}
              <div className="flex justify-between items-center">
                <dt className="text-2xl font-medium">Estado:</dt>
                <dd className={`text-2xl font-semibold uppercase ${
                  // Colores de estado del estándar
                  status === 'confirmed' ? 'text-[#16A34A]' : // Éxito
                  status === 'pending' ? 'text-[#FFC857]' : // Pendiente
                  status === 'rejected' ? 'text-[#EF4444]' : // Error
                  'text-[#64748B]' // Reservado/Ocupado
                  }`}>
                  {status === 'confirmed' ? '✓ CONFIRMADO' :
                    status === 'pending' ? '⏳ PENDIENTE' :
                    status}
                </dd>
              </div>

              <div className="my-4">
                {/* Primary Medium: #2B6AE0 */}
                <hr className="w-full border-t-2 border-[#2B6AE0]" />
              </div>
            </dl>

            {/* Botón simulador (solo para demo) */}
            <div className="mt-8">
              <button
                onClick={handleSimulatePayment}
                disabled={loading || status === 'confirmed'}
                className={`w-full px-6 py-4 rounded-lg text-xl font-semibold transition-colors ${
                  loading || status === 'confirmed'
                    // Neutros deshabilitado: #E5E7EB, #64748B
                    ? 'bg-[#E5E7EB] text-[#64748B] cursor-not-allowed'
                    // Botón primario: Main Blue #2B31E0, Hover: #2B6AE0, Texto: #F9FAFB
                    : 'bg-[#2B31E0] hover:bg-[#2B6AE0] text-[#F9FAFB]'
                  }`}
              >
                {loading ? '⏳ Procesando...' :
                  status === 'confirmed' ? '✓ Pago Confirmado' :
                  '💰 Simular Pago Completado'}
              </button>
              {/* Neutro: #64748B */}
              <p className="text-sm text-[#64748B] text-center mt-2">
                (Botón de prueba - En producción escanea el QR)
              </p>
            </div>
          </section>

          {/* QR Code */}
          {/* Highlight (Azul suave): #759AE0 para el fondo */}
          <aside className="bg-[#759AE0] rounded-xl p-5 md:justify-self-end w-full md:w-[420px] md:ml-16 md:self-start">
            {/* Texto principal oscuro: #111827 */}
            <h3 className="text-2xl font-semibold text-[#111827] mb-4 text-center">
              Escanea el código QR
            </h3>

            {/* Fondo claro para el QR: #F9FAFB */}
            <div className="h-80 w-full rounded-lg bg-[#F9FAFB] flex items-center justify-center p-4">
              <img
                src={fallbackQR}
                alt="QR de pago"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Texto principal oscuro: #111827 */}
            <p className="text-sm text-[#111827] text-center mt-4">
              Monto a pagar: <span className="font-bold text-lg">{money(amount)}</span>
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
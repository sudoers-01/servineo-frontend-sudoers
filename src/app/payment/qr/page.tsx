"use client";

import { useEffect, useState } from "react";    
import Link from "next/link";    //add
import BackButton from "../components/BackButton";
import { createQRIntent } from "../../lib/payments"; // <- SDK del front


//tipos simples
type PaymentStatus = "pending" | "under_review" | "confirmed" | "rejected" | "expired";
type Intent = {
  _id: string;
  bookingId: string;
  providerId: string;
  amountExpected: number;
  currency: string;
  paymentReference: string;
  status: PaymentStatus;
  deadlineAt?: string;
  createdAt?: string;
};
type PaymentMethod = { qrImageUrl?: string; accountDisplay?: string };

// Lee la URL del backend de tu .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function PaymentsPage() {
  //estado que llamamos desde el backend
  const [intent, setIntent] = useState<Intent | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //para la demos se esta usando valores fijos; luego se pasarna por porps/ruta
  const bookingId = "TEST-BOOKING-1";
  const providerId = "prov_123";
  const amount = 150; //monto en BOB
  const currency = "BOB";
  

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // [LOG B] payload que envías al backend
        const payload = { bookingId, providerId, amount, currency };
        console.log("→ POST /api/payments/intent payload =", payload);

        const res = await fetch(`${API_BASE}/api/payments/intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, providerId, amount, currency }),
        });

        // [LOG C] status de la respuesta
        console.log("← status", res.status);

        const data = await res.json();

        // [LOG D] cuerpo de la respuesta
        console.log("← body", data);

        if (!res.ok) throw new Error(data?.message || data?.error || "Error al crear intent");
        setIntent(data.intent);
        setMethod(data.paymentMethod || null);
        if (data.error === "NO_QR") setError("El proveedor no tiene QR configurado.");
      } catch (e: any) {
        setError(e.message || "Error de red");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  // [LOG A] — esto sale en la consola del navegador (DevTools > Console)
  console.log("API_BASE =", API_BASE);

  // Helper para formatear moneda (lo usamos en subtotal/comisión/total)
  const money = (n: number) =>
    n.toLocaleString("es-BO", { style: "currency", currency });

    //agregado
    const [imgSrc, setImgSrc] = useState<string | null>(null);

const toDriveThumb = (url: string) => {
  const m = url.match(/id=([^&]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w512` : url;
};

const fallbackQR = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent("Servineo QR")}`;

useEffect(() => {
  if (method?.qrImageUrl) {
    setImgSrc(method.qrImageUrl); // primero intentamos con uc?export=view
  }
}, [method]);

//fin agregado
  
   return (
    <div className="min-h-screen bg-white">
      {/* Barra negra superior */}
      <header className="bg-[#2B6AE0]">
        <div className="max-w-5xl px-6 py-6">
          <h1 className="text-5xl font-semibold text-white">Pagos con QR</h1>
        </div>
      </header>

      <BackButton
        fallback="/payments"
        className="fixed bottom-4 right-4 z-50"
      />

      <main className="max-w-5xl mx-auto p-6">
        {/* Mensajes básicos */}
        {loading && <p>Cargando…</p>}
        {error && <p className="text-red-600 mb-3">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <section className="md:-ml-35">
            <h2 className="text-4xl font-semibold mb-3 text-black">Información de pago</h2>

            {/* Separador corto, alineado a la izquierda */}
            <div className="my-2">
              <hr className="w-150 border-t-2 border-[#2B6AE0]" />
            </div>

            {/* LISTA CON POSICIÓN LIBRE PARA B (valores)
              - Cada fila: contenedor relative
              - A (etiqueta) se muestra normal (inline-block)
              - B (valor) es absolute y lo mueves con left/top o translate
            */}
            <dl className="space-y-6 text-black">
              {/* --- Fila: Destinatario --- */}
              <div className="relative min-h-8">
                {/* A: etiqueta con ancho fijo para consistencia visual */}
                <dt className="text-2xl font-medium inline-block w-[160px] text-left">
                  Destinatario:
                </dt>
                <dd className="text-2xl leading-tight absolute top-0.5 left-[190px]">
                  {method?.accountDisplay || "—"}
                </dd>
              </div>

              {/* --- Fila: Número de Transacción --- */}
              <div className="relative min-h-8">
                <dt className="text-2xl font-medium inline-block w-[240px] text-left whitespace-nowrap">
                  N° de Transacción:
                </dt>
                <dd className="text-2xl leading-tight absolute top-0 left-[240px]">
                  {intent?.paymentReference || "—"}
                </dd>
              </div>

              {/* --- Fila: Sub Total --- */}
              <div className="relative min-h-8">
                <dt className="text-2xl font-medium inline-block w-[160px] text-left">
                  Sub Total:
                </dt>
                {/* Ejemplo moviendo un poco más pegado a la etiqueta */}
                <dd className="text-2xl leading-tight absolute top-0 left-[190px]">
                  {intent ? money(Math.round(intent.amountExpected * 0.97)) : "—"}
                </dd>
              </div>

              {/* --- Fila: Comisión --- */}
              <div className="relative min-h-8">
                <dt className="text-2xl font-medium inline-block w-[160px] text-left">
                  Comisión:
                </dt>
                {/* Ejemplo bajando un poquito el valor (top-1) */}
                <dd className="text-2xl leading-tight absolute top-0 left-[190px]">
                  {intent ? money(Math.round(intent.amountExpected * 0.03)) : "—"}
                </dd>
              </div>

              {/* --- Fila: Total --- */}
              <div className="relative min-h-8">
                <dt className="text-2xl font-semibold inline-block w-[160px] text-left">
                  Total:
                </dt>
                {/* Ejemplo moviendo más a la derecha */}
                <dd className="text-2xl font-semibold leading-tight absolute top-0 left-[190px]">
                  {intent ? money(intent.amountExpected) : "—"}
                </dd>
              </div>

              {/* Separador corto */}
              <div className="my-2">
                <hr className="w-150 border-t-2 border-[#2B6AE0]" />
              </div>

              {/* Separador arriba */}
              <div className="my-9">
                <hr className="w-150 border-t-2 border-[#2B6AE0]" />
              </div>

              {/* --- Fila: Estado --- */}
              <div className="relative min-h-8 mt-6">
                <dt className="text-2xl font-medium inline-block w-[160px] text-left">
                  Estado:
                </dt>
                {/* Ejemplo usando translate-x en lugar de left */}
                <dd className="text-2xl leading-tight absolute top-0 left-0 translate-x-[190px]">
                  {intent?.status ? intent.status.toUpperCase() : "—"}
                </dd>
              </div>

              {/* Separador abajo */}
              <div className="my-7">
                <hr className="w-150 border-t-2 border-[#2B6AE0]" />
              </div>
            </dl>
          </section>

          {/* COLUMNA DERECHA: Cuadro gris con título dentro */}
          <aside className="bg-[#759AE0] rounded-xl p-5 md:justify-self-end w-full md:w-[420px] md:ml-16 md:self-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Escanea el código QR
            </h3>

            {/* Área interna (placeholder) para el QR o contenido extra */}
            <div className="h-64 w-full rounded-lg bg-gray-200 flex items-center justify-center">
              {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt="QR de pago"
                        className="max-h-60 object-contain"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          // 1º intento falló: probamos con thumbnail de Drive
                          if (imgSrc.includes("drive.google.com") && !imgSrc.includes("/thumbnail")) {
                            setImgSrc(toDriveThumb(imgSrc));
                          } else {
                            // 2º intento falló: usamos un QR fallback temporal
                            setImgSrc(fallbackQR);
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={fallbackQR}
                        alt="QR de pago (fallback)"
                        className="max-h-60 object-contain"
                      />
                    )}
                  </div>
                </aside>
              </div>
            </main>
          </div>
  );
}
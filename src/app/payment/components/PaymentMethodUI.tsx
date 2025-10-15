"use client";

import { useEffect, useState, useMemo } from "react";
import PaymentMethodCashFixer from "./PaymentMethodCashFixer";

export default function PaymentMethodUI({
  paymentId,
  onClose,
}: {
  paymentId: string | null;
  onClose: () => void;
}) {
  const [showFixerView, setShowFixerView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [summary, setSummary] = useState<{
    id: string;
    code?: string | null;
    status: "paid" | "pending" | "failed";
    expiresAt?: string | null;
    amount: { total: number; currency: string };
  } | null>(null);

  // Auto-ocultar notificación después de 10 segundos
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Función para cargar summary (reutilizable)
  const loadSummary = async () => {
    if (!paymentId) {
      setErr("No hay paymentId para consultar.");
      setLoading(false);
      return;
    }
    setErr(null);
    setLoading(true);
    setShowNotification(true);
    
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/lab/payments/${paymentId}/summary?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();

      const d = data?.data ?? data;
      const total =
        typeof d?.total === "number"
          ? d.total
          : typeof d?.amount?.total === "number"
          ? d.amount.total
          : NaN;

      const uiSummary = {
        id: String(d?.id ?? d?._id ?? paymentId),
        code: d?.code ?? null,
        status: (d?.status ?? "pending") as "paid" | "pending" | "failed",
        expiresAt: d?.expiresAt ?? null,
        amount: {
          total,
          currency: d?.amount?.currency ?? d?.currency ?? "BOB",
        },
      };

      setSummary(uiSummary);
    } catch (e: any) {
      setErr(e.message || "No se pudo cargar el resumen");
    } finally {
      setLoading(false);
    }
  };

  // GET summary al montar
  useEffect(() => {
    let alive = true;
    (async () => {
      await loadSummary();
    })();
    return () => {
      alive = false;
    };
  }, [paymentId]);

  // Calcular tiempo restante de vigencia
  const expiryInfo = useMemo(() => {
    if (!summary?.expiresAt) return null;

    const now = new Date();
    const expiry = new Date(summary.expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { expired: true, hoursLeft: 0, minutesLeft: 0 };
    }

    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, hoursLeft, minutesLeft };
  }, [summary?.expiresAt]);

  const handleContinuar = () => setShowFixerView(true);
  
  const handleVolver = async (opts?: { refresh?: boolean }) => {
    setShowFixerView(false);
    // Si se solicita refresh, recargar los datos
    if (opts?.refresh) {
      await loadSummary();
    }
  };

  // Vista del proveedor
  if (showFixerView && summary) {
    return (
      <PaymentMethodCashFixer
        trabajo={{
          id: summary.id,
          monto: summary.amount.total,
        }}
        onClose={onClose}
        onBack={handleVolver}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl px-8 py-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Cargando resumen…</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (err) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl px-8 py-6 space-y-3 max-w-md">
          <div className="text-red-600 font-medium text-lg">Error</div>
          <div className="text-gray-700 text-sm">{err}</div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  // Vista inicial (REQUESTER)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h1 className="text-xl font-semibold">
            Método de pago Efectivo — Vista REQUESTER
          </h1>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 px-3 py-1 rounded text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Muestra este código al proveedor
            </h2>
            <h2 className="text-2xl font-bold text-gray-900">
              para confirmar tu pago
            </h2>
          </div>

          {/* Notificación de vigencia de 48 horas (desaparece automáticamente) */}
          {expiryInfo && showNotification && (
            <div className="max-w-xl mx-auto mb-8 relative">
              {expiryInfo.expired ? (
                // Código expirado
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg animate-fade-in">
                  <button
                    onClick={() => setShowNotification(false)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl"
                  >
                    ×
                  </button>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        ⚠️ Este código ha <strong>expirado</strong>. Por favor, genera uno nuevo.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Código vigente
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-lg animate-fade-in">
                  <button
                    onClick={() => setShowNotification(false)}
                    className="absolute top-2 right-2 text-amber-500 hover:text-amber-700 font-bold text-xl"
                  >
                    ×
                  </button>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 pr-6">
                      <p className="text-sm font-medium text-amber-800">
                        ⏰ Este código tiene una vigencia de <strong>48 horas</strong>
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Tiempo restante: <strong>{expiryInfo.hoursLeft}h {expiryInfo.minutesLeft}m</strong>
                      </p>
                      {summary.expiresAt && (
                        <p className="text-xs text-amber-600 mt-1">
                          Expira: {new Date(summary.expiresAt).toLocaleString('es-BO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campos del pago */}
          <div className="space-y-6 max-w-xl mx-auto">
            {/* Código */}
            <LabeledReadOnly 
              label="Código de Trabajo" 
              value={summary.code ?? "—"} 
              highlight={false}
            />
            
            {/* Total */}
            <LabeledReadOnly
              label="Monto a Pagar"
              value={
                Number.isFinite(summary.amount.total)
                  ? `${summary.amount.total} ${summary.amount.currency}`
                  : "—"
              }
            />
            
            {/* Estado */}
            <div className="flex items-center gap-6">
              <label className="text-lg font-semibold text-gray-900 w-48 text-left">
                Estado
              </label>
              <input
                type="text"
                value={
                  summary.status === 'paid' ? 'PAID' :
                  summary.status === 'failed' ? 'FAILED' :
                  'PENDING'
                }
                readOnly
                className="flex-1 px-4 py-3 rounded-md text-lg bg-gray-100 border border-gray-300 text-gray-700 text-center uppercase font-semibold"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-6 mt-12">
            <button
              onClick={handleContinuar}
              disabled={expiryInfo?.expired}
              className={`px-12 py-3 text-white text-lg font-semibold rounded-md transition-colors ${
                expiryInfo?.expired
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {expiryInfo?.expired ? 'Código Expirado' : 'Continuar'}
            </button>
            <button
              onClick={onClose}
              className="px-12 py-3 bg-black text-white text-lg font-semibold rounded-md hover:bg-gray-800 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers UI ---------------- */

function LabeledReadOnly({ 
  label, 
  value,
  highlight = false
}: { 
  label: string; 
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-6">
      <label className="text-lg font-semibold text-gray-900 w-48 text-left">
        {label}
      </label>
      <input
        type="text"
        value={value}
        readOnly
        className={`flex-1 px-4 py-3 rounded-md text-lg ${
          highlight 
            ? 'bg-blue-50 border-2 border-blue-300 text-blue-900 font-bold text-center tracking-widest'
            : 'bg-gray-100 border border-gray-300 text-gray-700'
        }`}
      />
    </div>
  );
}
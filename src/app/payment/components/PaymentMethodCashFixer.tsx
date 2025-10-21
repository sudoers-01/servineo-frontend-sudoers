"use client";

import { useEffect, useMemo, useState } from "react";

export default function PaymentMethodCashFixer({
  trabajo,
  onClose,
  onBack,
}: {
  trabajo: { id: string; monto?: number } | null;
  onClose: () => void;
  onBack: (opts?: { refresh?: boolean }) => void;
}) {
  // Estados de UI
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [loading, setLoading] = useState(true);
  const [patching, setPatching] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Intentos/bloqueo
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [unlockAtISO, setUnlockAtISO] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [wasLocked, setWasLocked] = useState(false);
  const [showUnlockMessage, setShowUnlockMessage] = useState(false);

  // Estados de código
  const [codeExpired, setCodeExpired] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState<string | null>(null);

  // Summary
  const [summary, setSummary] = useState<{
    id: string;
    code?: string | null;
    status: "paid" | "pending" | "failed";
    amount: { total: number; currency: string };
  } | null>(null);

  // Countdown para desbloqueo
  const msLeft = useMemo(() => {
    if (!unlockAtISO) return 0;
    const unlockMs = new Date(unlockAtISO).getTime();
    return Math.max(0, unlockMs - now);
  }, [unlockAtISO, now]);

  // Countdown para expiración del código
  const msUntilExpiration = useMemo(() => {
    if (!codeExpiresAt) return 0;
    const expiresMs = new Date(codeExpiresAt).getTime();
    return Math.max(0, expiresMs - now);
  }, [codeExpiresAt, now]);

  useEffect(() => {
    if (!unlockAtISO && !codeExpiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [unlockAtISO, codeExpiresAt]);

  const minutesLeft = Math.floor(msLeft / 60000);
  const secondsLeft = Math.floor((msLeft % 60000) / 1000);

  const hoursUntilExpiration = Math.floor(msUntilExpiration / 3600000);
  const minutesUntilExpiration = Math.floor((msUntilExpiration % 3600000) / 60000);
  const secondsUntilExpiration = Math.floor((msUntilExpiration % 60000) / 1000);

  const locked = !!unlockAtISO && msLeft > 0;

  // Detectar cuando se desbloquea
  useEffect(() => {
    if (wasLocked && !locked && unlockAtISO) {
      console.log("🔓 Cuenta desbloqueada");
      setShowUnlockMessage(true);
      setUnlockAtISO(null);
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setShowUnlockMessage(false);
      }, 5000);
    }
    
    if (locked) {
      setWasLocked(true);
    }
  }, [locked, unlockAtISO, wasLocked]);

  // GET summary
  async function fetchSummary() {
    if (!trabajo?.id) {
      setErr("No hay paymentId para consultar.");
      setLoading(false);
      return;
    }
    
    setErr(null);
    setOkMsg(null);
    setRemainingAttempts(null);
    setUnlockAtISO(null);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/lab/payments/${trabajo.id}/summary`, {
        cache: "no-store",
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log("📦 [FIXER] Backend response completo:", data);
      
      const d = data?.data ?? data;
      console.log("📋 [FIXER] Data parseada:", d);

      const total =
        typeof d?.total === "number"
          ? d.total
          : typeof d?.amount?.total === "number"
          ? d.amount.total
          : NaN;

      // Detectar código expirado
      const backendExpired = d?.codeExpired === true;
      const manualExpired = d?.codeExpiresAt && new Date(d.codeExpiresAt) < new Date();
      const isExpired = backendExpired || manualExpired;

      console.log("⏰ [FIXER] Verificación expiración en fetchSummary:", {
        backendExpired,
        codeExpiresAt: d?.codeExpiresAt,
        codeExpiresAtParsed: d?.codeExpiresAt ? new Date(d.codeExpiresAt).toLocaleString('es-BO') : null,
        now: new Date().toLocaleString('es-BO'),
        nowISO: new Date().toISOString(),
        manualExpired,
        isExpired
      });

      // Actualizar estado de expiración
      if (isExpired && !codeExpired) {
        console.log("🔴 [FIXER] CÓDIGO EXPIRADO detectado en fetchSummary");
        setCodeExpired(true);
        setErr("El código ha expirado. Solicite al cliente que genere un nuevo código.");
      } else if (!isExpired && codeExpired) {
        // Si se regeneró el código, limpiar el estado de expiración
        console.log("✅ [FIXER] Código renovado, limpiando estado de expiración");
        setCodeExpired(false);
        setErr(null);
      }

      // Actualizar codeExpiresAt
      if (d?.codeExpiresAt) {
        setCodeExpiresAt(d.codeExpiresAt);
      }

      setSummary({
        id: String(d?.id ?? d?._id ?? trabajo.id),
        code: d?.code ?? null,
        status: (d?.status ?? "pending") as "paid" | "pending" | "failed",
        amount: {
          total,
          currency: d?.amount?.currency ?? d?.currency ?? "BOB",
        },
      });
      
    } catch (e: any) {
      console.error("❌ [FIXER] Error en fetchSummary:", e);
      setErr(e.message || "No se pudo cargar el resumen");
    } finally {
      setLoading(false);
    }
  }

  // Cargar summary al montar
  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trabajo?.id]);

  // Verificación automática de expiración cada segundo
  useEffect(() => {
    if (!codeExpiresAt || codeExpired) return;
    
    const checkExpiration = () => {
      const expiresMs = new Date(codeExpiresAt).getTime();
      const nowMs = Date.now();
      
      const secondsLeft = (expiresMs - nowMs) / 1000;
      
      console.log("⏰ [FIXER] Verificando expiración (auto-check):", {
        expiresAt: new Date(expiresMs).toLocaleString('es-BO'),
        expiresAtISO: new Date(expiresMs).toISOString(),
        now: new Date(nowMs).toLocaleString('es-BO'),
        nowISO: new Date(nowMs).toISOString(),
        secondsLeft: secondsLeft.toFixed(2),
        expired: nowMs >= expiresMs
      });
      
      if (nowMs >= expiresMs && !codeExpired) {
        console.log("🔴 [FIXER] CÓDIGO EXPIRADO detectado por auto-check");
        setCodeExpired(true);
        setErr("El código ha expirado. Solicite al cliente que genere un nuevo código.");
      }
    };

    // Verificar inmediatamente
    checkExpiration();
    
    // Verificar cada segundo
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [codeExpiresAt, codeExpired]);

  // Confirmar pago
  const handleContinuar = async () => {
    if (!summary) return;

    const provided = (codigoIngresado || "").toUpperCase().trim();
    if (!provided) {
      setErr("Ingrese el código.");
      return;
    }

    setOkMsg(null);
    setErr(null);
    setRemainingAttempts(null);
    setUnlockAtISO(null);
    setShowUnlockMessage(false);
    setPatching(true);

    try {
      const res = await fetch(`/api/lab/payments/${summary.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: provided }),
      });

      const responseData = await res.json();

      // ✅ Código correcto - Mostrar modal de éxito
      if (res.ok) {
        console.log("✅ [FIXER] Pago confirmado exitosamente");
        setShowSuccessModal(true);
        await fetchSummary();
        setCodigoIngresado("");
        return;
      }

      // ❌ Manejo de errores según código de estado
      
      // 429 - Bloqueado por demasiados intentos
      if (res.status === 429) {
        if (responseData.unlocksAt) {
          setUnlockAtISO(responseData.unlocksAt);
        } else if (responseData.waitMinutes) {
          const unlockDate = new Date(Date.now() + responseData.waitMinutes * 60000);
          setUnlockAtISO(unlockDate.toISOString());
        }
        
        const errorMsg = responseData.message || responseData.error || 
          "Has superado el número máximo de intentos. La cuenta está bloqueada temporalmente.";
        throw new Error(errorMsg);
      }

      // 401 - Código inválido con intentos restantes
      if (res.status === 401) {
        if (typeof responseData.remainingAttempts === "number") {
          setRemainingAttempts(responseData.remainingAttempts);
        }
        
        const errorMsg = responseData.message || responseData.error || "Código inválido";
        throw new Error(errorMsg);
      }

      // 410 - Código expirado
      if (res.status === 410) {
        setCodeExpired(true);
        throw new Error(responseData.error || "El código ha expirado. Solicite al cliente que genere un nuevo código.");
      }

      // 400 - Bad Request
      if (res.status === 400) {
        throw new Error(responseData.error || "Solicitud inválida");
      }

      // 404 - No encontrado
      if (res.status === 404) {
        throw new Error(responseData.error || "Pago no encontrado");
      }

      // 409 - Conflicto (ya procesado)
      if (res.status === 409) {
        throw new Error(responseData.error || "El pago ya fue procesado");
      }

      // Otros errores
      throw new Error(responseData.error || responseData.message || `Error ${res.status}`);

    } catch (e: any) {
      setErr(e.message || "Error al confirmar el pago");
    } finally {
      setPatching(false);
    }
  };

  const handleVolver = () => {
    onBack({ refresh: true });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onClose();
  };

  // Modal de éxito
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-black rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ✓ Código correcto! Pago confirmado
          </h2>
          <button
            onClick={handleCloseSuccessModal}
            className="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded transition-colors w-full"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Overlay>
        <Box>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Cargando datos del pago…</p>
          </div>
        </Box>
      </Overlay>
    );
  }

  if (err && !summary) {
    return (
      <Overlay>
        <Box>
          <div className="text-red-600 font-medium text-lg mb-2">Error</div>
          <div className="text-gray-700 text-sm mb-4">{err}</div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={handleVolver} 
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Volver
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
            >
              Cerrar
            </button>
          </div>
        </Box>
      </Overlay>
    );
  }

  if (!summary) return null;

  return (
    <Overlay>
      <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h1 className="text-xl font-semibold">Método de pago Efectivo — Vista FIXER</h1>
          <button 
            onClick={onClose} 
            className="hover:bg-blue-700 px-3 py-1 rounded text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Confirmación del pago recibido</h2>
          </div>

          {/* Mensaje de desbloqueo */}
          {showUnlockMessage && (
            <div className="mb-6 max-w-xl mx-auto animate-fade-in">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-green-800">
                      🔓 El periodo de bloqueo de 10 minutos ha finalizado. Ya puedes intentar nuevamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerta de código expirado */}
          {codeExpired && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      ⏱️ El código ha expirado
                    </p>
                    <p className="text-xs text-amber-700">
                      Solicite al cliente que genere un nuevo código desde su vista para continuar con el pago.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerta de bloqueo */}
          {locked && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      🔒 Cuenta bloqueada temporalmente por intentos fallidos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info de tiempo restante hasta expiración */}
          {!codeExpired && codeExpiresAt && msUntilExpiration > 0 && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-blue-700 text-sm text-center">
                  ⏰ Código válido por: <b>
                    {hoursUntilExpiration > 0 && `${hoursUntilExpiration}h `}
                    {minutesUntilExpiration}m {secondsUntilExpiration}s
                  </b>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6 max-w-xl mx-auto">
            {/* Código (editable) */}
            <RowInput
              label="Código de Trabajo"
              value={codigoIngresado}
              onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
              placeholder="Ingresa el código del cliente"
              disabled={locked || patching || codeExpired}
            />

            {/* Monto */}
            <ReadOnly 
              label="Monto a Cobrar" 
              value={`${summary.amount.total} ${summary.amount.currency}`} 
            />

            {/* Estado */}
            <ReadOnly 
              label="Estado" 
              value={
                  summary.status === 'paid' ? 'CONFIRMADO' :
                  summary.status === 'failed' ? 'ERROR' :
                  'PENDIENTE'
                }
            />
          </div>

          {/* Mensajes */}
          <div className="mt-6 text-center space-y-2">
            {err && !codeExpired && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-rose-600 font-medium">{err}</p>
              </div>
            )}
            
            {remainingAttempts !== null && !locked && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2">
                <p className="text-amber-700 text-sm">
                  ⚠️ Intentos restantes: <b>{remainingAttempts}</b>
                </p>
              </div>
            )}
            
            {locked && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-700 text-sm font-medium">
                  🔒 Cuenta bloqueada. Intenta en:{" "}
                  <b className="text-lg">
                    {minutesLeft > 0 ? `${minutesLeft}m ` : ""}
                    {secondsLeft}s
                  </b>
                </p>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-6 mt-12">
            <button
              onClick={handleContinuar}
              disabled={!codigoIngresado || patching || locked || codeExpired}
              className={`px-12 py-3 text-white text-lg font-semibold rounded-md transition-colors ${
                !codigoIngresado || patching || locked || codeExpired
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {patching ? "Confirmando…" : locked ? "Bloqueado" : codeExpired ? "Código Expirado" : "Confirmar Pago Recibido"}
            </button>
            <button
              onClick={handleVolver}
              disabled={patching}
              className="px-12 py-3 bg-black text-white text-lg font-semibold rounded-md hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              Volver
            </button>
          </div>

          {/* Hint */}
          <div className="mt-6 text-center text-sm text-gray-500">
            ID pago: <span className="font-mono text-gray-700">{summary.id}</span>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ---------- helpers UI ---------- */

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {children}
    </div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-xl px-8 py-6 max-w-md">
      {children}
    </div>
  );
}

function RowInput(props: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { label, value, onChange, placeholder, disabled } = props;
  return (
    <div className="flex items-center gap-6">
      <label className="text-lg font-semibold text-gray-900 w-48 text-left">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 bg-white disabled:bg-gray-100 border-2 border-blue-300 rounded-md text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed uppercase"
      />
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-6">
      <label className="text-lg font-semibold text-gray-900 w-48 text-left">
        {label}
      </label>
      <input
        type="text"
        value={value}
        readOnly
        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-lg"
      />
    </div>
  );
}
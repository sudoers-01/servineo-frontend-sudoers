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

  // Intentos/bloqueo
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [unlockAtISO, setUnlockAtISO] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Summary
  const [summary, setSummary] = useState<{
    id: string;
    code?: string | null;
    status: "paid" | "pending" | "failed";
    amount: { total: number; currency: string };
  } | null>(null);

  // Countdown
  const msLeft = useMemo(() => {
    if (!unlockAtISO) return 0;
    const unlockMs = new Date(unlockAtISO).getTime();
    return Math.max(0, unlockMs - now);
  }, [unlockAtISO, now]);

  useEffect(() => {
    if (!unlockAtISO) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [unlockAtISO]);

  const minutesLeft = Math.floor(msLeft / 60000);
  const secondsLeft = Math.floor((msLeft % 60000) / 1000);

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
      const d = data?.data ?? data;

      const total =
        typeof d?.total === "number"
          ? d.total
          : typeof d?.amount?.total === "number"
          ? d.amount.total
          : NaN;

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
      setErr(e.message || "No se pudo cargar el resumen");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trabajo?.id]);

  // Handlers
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
    setPatching(true);

    try {
      const res = await fetch(`/api/lab/payments/${summary.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: provided }),
      });

      const responseData = await res.json();

      // ✅ Código correcto
      if (res.ok) {
        setOkMsg(responseData?.message || "Pago confirmado exitosamente.");
        // Refrescar summary desde backend
        await fetchSummary();
        // Limpiar el input después de confirmación exitosa
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
        throw new Error(responseData.error || "El código ha expirado");
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

  // Render
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

  const locked = !!unlockAtISO && msLeft > 0;

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

          <div className="space-y-6 max-w-xl mx-auto">
            {/* Código (editable) */}
            <RowInput
              label="Código de Trabajo"
              value={codigoIngresado}
              onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
              placeholder="Ingresa el código del cliente"
              disabled={locked || patching}
            />

            {/* Monto */}
            <ReadOnly 
              label="Monto a Cobrar" 
              value={`${summary.amount.total} ${summary.amount.currency}`} 
            />

            {/* Estado */}
            <ReadOnly 
              label="Estado" 
              value={summary.status.toUpperCase()} 
            />
          </div>

          {/* Mensajes */}
          <div className="mt-6 text-center space-y-2">
            {okMsg && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-emerald-700 font-medium">{okMsg}</p>
              </div>
            )}
            
            {err && (
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
              disabled={!codigoIngresado || patching || locked}
              className={`px-12 py-3 text-white text-lg font-semibold rounded-md transition-colors ${
                !codigoIngresado || patching || locked
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {patching ? "Confirmando…" : locked ? "Bloqueado" : "Continuar"}
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
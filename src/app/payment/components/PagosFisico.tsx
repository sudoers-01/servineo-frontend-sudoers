'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, DollarSign, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

// Modal de pago en efectivo
function PaymentMethodCashFixer({ trabajo, onClose, onBack }) {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [loading, setLoading] = useState(true);
  const [patching, setPatching] = useState(false);
  const [mainMessage, setMainMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [summary, setSummary] = useState(null);

  // Intentos y bloqueo
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [unlockAtISO, setUnlockAtISO] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [wasLocked, setWasLocked] = useState(false);

  // Expiración de Código
  const [codeExpired, setCodeExpired] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);

  // Timers de bloqueo/expiración
  const msLeft = useMemo(() => {
    if (!unlockAtISO) return 0;
    const unlockMs = new Date(unlockAtISO).getTime();
    return Math.max(0, unlockMs - now);
  }, [unlockAtISO, now]);

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
      setMainMessage({
        type: 'success',
        text: '🔓 El periodo de bloqueo de 10 minutos ha finalizado. Ya puedes intentar nuevamente.'
      });
      setUnlockAtISO(null);
      setTimeout(() => setMainMessage(null), 5000);
    }
    if (locked) setWasLocked(true);
  }, [locked, unlockAtISO, wasLocked]);

  const handleCodigoChange = (e) => {
    const value = e.target.value.toUpperCase();
    const filtered = value.replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCodigoIngresado(filtered);
  };

  async function fetchSummary() {
    if (!trabajo?.jobId) {
      setMainMessage({ type: 'error', text: 'No hay paymentId para consultar.' });
      setLoading(false);
      return;
    }

    setMainMessage(null);
    setRemainingAttempts(null);
    setUnlockAtISO(null);
    setLoading(true);
    console.log('🔍 Cargando summary para:', trabajo.jobId);

    try {
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(trabajo.jobId);
      
      if (isObjectId) {
        const url = `/api/lab/payments/${trabajo.jobId}/summary?t=${Date.now()}`;
        console.log('🔗 Llamando API:', url);
        
        const res = await fetch(url, { cache: 'no-store' });
        console.log('📥 Status:', res.status);
        
        if (!res.ok) throw new Error(`Error ${res.status}`);
        
        const data = await res.json();
        console.log('✅ Datos:', data);
        
        const d = data?.data ?? data;

        const total = typeof d?.total === "number" ? d.total : typeof d?.amount?.total === "number" ? d.amount.total : 0;

        // Detectar código expirado
        const backendExpired = d?.codeExpired === true;
        const manualExpired = d?.codeExpiresAt && new Date(d.codeExpiresAt) < new Date();
        const isExpired = backendExpired || manualExpired;

        console.log("⏰ Verificación expiración:", {
          backendExpired,
          codeExpiresAt: d?.codeExpiresAt,
          manualExpired,
          isExpired
        });

        if (isExpired && !codeExpired) {
          console.log("🔴 CÓDIGO EXPIRADO detectado");
          setCodeExpired(true);
          setMainMessage({
            type: 'warning',
            text: '⏱️ El código ha expirado. Solicite al cliente que genere un nuevo código desde su vista para continuar con el pago.'
          });
        } else if (!isExpired && codeExpired) {
          console.log("✅ Código renovado");
          setCodeExpired(false);
          setMainMessage(null);
        }

        if (d?.codeExpiresAt) {
          setCodeExpiresAt(d.codeExpiresAt);
        }

        setSummary({
          id: String(d?.id ?? trabajo.jobId),
          code: d?.code ?? null,
          status: d?.status ?? 'pending',
          amount: {
            total,
            currency: d?.currency ?? d?.amount?.currency ?? 'BOB',
          },
        });
      } else {
        await new Promise(r => setTimeout(r, 500));
        setSummary({
          id: trabajo.jobId,
          status: trabajo.paymentStatus || "pending",
          amount: { total: trabajo.totalPagar || 0, currency: "BOB" },
        });
      }
    } catch (e) {
      console.error('❌ Error:', e);
      setMainMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, [trabajo?.jobId]);

  // Verificación automática de expiración
  useEffect(() => {
    if (!codeExpiresAt || codeExpired) return;

    const checkExpiration = () => {
      const expiresMs = new Date(codeExpiresAt).getTime();
      const nowMs = Date.now();

      if (nowMs >= expiresMs && !codeExpired) {
        console.log("🔴 CÓDIGO EXPIRADO detectado por auto-check");
        setCodeExpired(true);
        setMainMessage({
          type: 'warning',
          text: '⏱️ El código ha expirado. Solicite al cliente que genere un nuevo código desde su vista para continuar con el pago.'
        });
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [codeExpiresAt, codeExpired]);

  const handleContinuar = async () => {
    if (!summary) return;

    const code = codigoIngresado.trim();
    if (!code) {
      setMainMessage({ type: 'error', text: 'Por favor, ingrese el código de 6 caracteres.' });
      return;
    }
    if (code.length !== 6) {
      setMainMessage({ type: 'error', text: 'El código debe tener exactamente 6 caracteres.' });
      return;
    }

    setMainMessage(null);
    setRemainingAttempts(null);
    setUnlockAtISO(null);
    setPatching(true);

    try {
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(summary.id);
      
      if (isObjectId) {
        const res = await fetch(`/api/lab/payments/${summary.id}/confirm`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const resp = await res.json().catch(() => ({}));
        
        if (res.ok) {
          console.log("✅ Pago confirmado exitosamente");
          setShowSuccessModal(true);
          await fetchSummary();
          setCodigoIngresado('');
          return;
        }
        
        if (res.status === 429) {
          if (resp.unlocksAt) setUnlockAtISO(String(resp.unlocksAt));
          else if (resp.waitMinutes) {
            const unlockDate = new Date(Date.now() + Number(resp.waitMinutes) * 60000);
            setUnlockAtISO(unlockDate.toISOString());
          }
          setMainMessage({ type: 'error', text: '🔒 Has superado el número máximo de intentos (3). La cuenta está bloqueada temporalmente por 10 minutos.' });
          return;
        }
        
        if (res.status === 401) {
          const attempts = Number(resp.remainingAttempts);
          if (!Number.isNaN(attempts)) {
            setRemainingAttempts(attempts);
            setMainMessage({
              type: 'error',
              text: `❌ Código inválido. Te quedan ${attempts} intento${attempts !== 1 ? 's' : ''}.`
            });
          } else {
            setMainMessage({ type: 'error', text: '❌ Código inválido.' });
          }
          return;
        }
        
        if (res.status === 410) {
          setCodeExpired(true);
          setMainMessage({
            type: 'warning',
            text: '⏱️ El código ha expirado. Solicite al cliente que genere un nuevo código.'
          });
          return;
        }
        
        if (res.status === 404) {
          setMainMessage({ type: 'error', text: 'Pago no encontrado' });
          return;
        }
        
        if (res.status === 409) {
          setMainMessage({ type: 'error', text: 'El pago ya fue procesado' });
          return;
        }
        
        setMainMessage({ type: 'error', text: resp?.error || `Error ${res.status}` });
      } else {
        await new Promise(r => setTimeout(r, 1000));
        setShowSuccessModal(true);
        setCodigoIngresado('');
      }
    } catch (e) {
      setMainMessage({ type: 'error', text: e.message });
    } finally {
      setPatching(false);
    }
  };

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-black rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#16A34A] rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">✓ Código correcto! Pago confirmado</h2>
          <button
            onClick={() => { setShowSuccessModal(false); onClose(true); }}
            className="mt-6 px-8 py-3 bg-[#2B31E0] hover:bg-[#2B6AE0] text-white text-lg font-semibold rounded transition-colors w-full"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#F9FAFB] rounded-lg shadow-xl px-8 py-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B31E0] mb-4"></div>
            <p className="text-[#111827]">Cargando datos del pago…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F9FAFB] w-full max-w-2xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="bg-[#2B31E0] text-[#F9FAFB] px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h1 className="text-xl font-semibold">Método de pago Efectivo — Vista FIXER</h1>
          <button onClick={() => onClose()} className="hover:bg-[#2B6AE0] px-3 py-1 rounded text-xl transition-colors">✕</button>
        </div>

        <div className="px-8 py-12">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-12">Confirmación del pago recibido</h2>

          {mainMessage && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className={`border-l-4 p-4 rounded ${
                mainMessage.type === 'error' ? 'bg-red-50 border-[#EF4444]' :
                mainMessage.type === 'warning' ? 'bg-amber-50 border-[#F59E0B]' :
                mainMessage.type === 'success' ? 'bg-green-50 border-[#16A34A]' :
                'bg-blue-50 border-[#759AE0]'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 mt-0.5 ${
                      mainMessage.type === 'error' ? 'text-[#EF4444]' :
                      mainMessage.type === 'warning' ? 'text-[#F59E0B]' :
                      mainMessage.type === 'success' ? 'text-[#16A34A]' :
                      'text-[#759AE0]'
                    }`} viewBox="0 0 20 20" fill="currentColor">
                      {mainMessage.type === 'success' ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : mainMessage.type === 'error' ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      )}
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      mainMessage.type === 'error' ? 'text-red-800' :
                      mainMessage.type === 'warning' ? 'text-amber-800' :
                      mainMessage.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>
                      {mainMessage.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {locked && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className="bg-red-50 border border-[#EF4444] rounded p-3">
                <p className="text-red-700 text-sm font-medium text-center">
                  🔒 Cuenta bloqueada. Intenta en: <b className="text-lg">{minutesLeft > 0 ? `${minutesLeft}m ` : ""}{secondsLeft}s</b>
                </p>
              </div>
            </div>
          )}

          {!codeExpired && codeExpiresAt && msUntilExpiration > 0 && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className="bg-blue-50 border border-[#759AE0] rounded p-3">
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
            <div className="flex items-center gap-6">
              <label className="text-lg font-semibold text-[#111827] w-48 text-left">Código de Trabajo</label>
              <input
                type="text"
                value={codigoIngresado}
                onChange={handleCodigoChange}
                placeholder="CODIGO"
                disabled={patching || locked || codeExpired}
                maxLength={6}
                className="flex-1 px-4 py-3 bg-white disabled:bg-[#E5E7EB] border-2 border-[#759AE0] rounded-md text-[#111827] text-lg focus:outline-none focus:ring-2 focus:ring-[#759AE0] disabled:cursor-not-allowed uppercase"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="text-lg font-semibold text-[#111827] w-48 text-left">Monto a Cobrar</label>
              <input
                type="text"
                value={`${summary.amount.total.toFixed(2)} ${summary.amount.currency}`}
                readOnly
                className="flex-1 px-4 py-3 bg-[#E5E7EB] border border-[#D1D5DB] rounded-md text-[#111827] text-lg"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="text-lg font-semibold text-[#111827] w-48 text-left">Estado</label>
              <input
                type="text"
                value={summary.status === 'paid' ? 'CONFIRMADO' : summary.status === 'failed' ? 'ERROR' : 'PENDIENTE'}
                readOnly
                className="flex-1 px-4 py-3 bg-[#E5E7EB] border border-[#D1D5DB] rounded-md text-[#111827] text-lg"
              />
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-12">
            <button
              onClick={handleContinuar}
              disabled={!codigoIngresado || patching || locked || codeExpired}
              className={`px-12 py-3 text-lg font-semibold rounded-md transition-colors ${
                !codigoIngresado || patching || locked || codeExpired
                  ? "bg-[#D1D5DB] text-[#64748B] cursor-not-allowed"
                  : "bg-[#2B31E0] hover:bg-[#2B6AE0] text-[#F9FAFB]"
              }`}
            >
              {patching ? "Confirmando…" : locked ? "Bloqueado" : codeExpired ? "Código Expirado" : "Confirmar Pago Recibido"}
            </button>
            <button
              onClick={() => onBack({ refresh: true })}
              disabled={patching}
              className="px-12 py-3 bg-[#2BDDE0] text-[#111827] text-lg font-semibold rounded-md hover:bg-[#5E2BE0] transition-colors disabled:opacity-60"
            >
              Volver
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            ID pago: <span className="font-mono text-[#64748B]">{summary.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function TrabajosYPagos() {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fixerId, setFixerId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fixerId') || localStorage.getItem('userId');
      const urlParams = new URLSearchParams(window.location.search);
      const urlFixerId = urlParams.get('fixerId');
      
      const id = '690c1a08f32ebc5be9c5707c';
      
      console.log('🔑 Fixer ID detectado:', id);
      setFixerId(id);
      
      if (id && !stored) {
        localStorage.setItem('fixerId', id);
        try {
          const url = new URL(window.location.href);
          if (url.searchParams.get('fixerId') !== id) {
            url.searchParams.set('fixerId', id);
            window.history.replaceState({}, '', url.toString());
          }
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (fixerId) {
      fetchTrabajos();
    }
  }, [fixerId]);

  const fetchTrabajos = async () => {
    setLoading(true);
    setError(null);
    
    console.log('📋 Cargando trabajos para fixerId:', fixerId);

    try {
      const isValidId = /^[a-fA-F0-9]{24}$/.test(fixerId);
      
      if (isValidId) {
        console.log('✅ ID válido, consultando API...');
        
        const [pendingRes, paidRes] = await Promise.all([
          fetch(`/api/lab/payments/by-fixer/${fixerId}/summary?status=pending`, { cache: 'no-store' }),
          fetch(`/api/lab/payments/by-fixer/${fixerId}/summary?status=paid`, { cache: 'no-store' }),
        ]);

        console.log('📥 Pending response:', pendingRes.status);
        console.log('📥 Paid response:', paidRes.status);

        const pending = pendingRes.ok ? await pendingRes.json() : { data: [] };
        const paid = paidRes.ok ? await paidRes.json() : { data: [] };

        console.log('📦 Pending data:', pending);
        console.log('📦 Paid data:', paid);

        const pendingArray = Array.isArray(pending?.data) ? pending.data : [];
        const paidArray = Array.isArray(paid?.data) ? paid.data : [];

        console.log(`✅ Encontrados: ${pendingArray.length} pendientes, ${paidArray.length} pagados`);

        const mapped = [...pendingArray, ...paidArray].map(x => ({
          jobId: String(x.id || x._id),
          titulo: `Pago #${String(x.id || x._id).slice(-6).toUpperCase()}`,
          descripcion: `Monto: Bs. ${(x.total || 0).toFixed(2)}`,
          totalPagar: x.total || 0,
          paymentStatus: x.status || 'pending',
          fecha: x.createdAt ? new Date(x.createdAt).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
        }));

        console.log('🎯 Trabajos mapeados:', mapped);
        setTrabajos(mapped);
        
        if (mapped.length === 0) {
          setError('No se encontraron trabajos para este fixer.');
        }
      } else {
        console.log('⚠️ ID inválido, usando datos simulados');
        await new Promise(r => setTimeout(r, 1000));
        setTrabajos([
          { jobId: "SIM-001", titulo: "Pago Simulado 1", descripcion: "Trabajo de prueba", totalPagar: 250.00, paymentStatus: "pending", fecha: "2025-11-08" },
          { jobId: "SIM-002", titulo: "Pago Simulado 2", descripcion: "Trabajo completado", totalPagar: 180.50, paymentStatus: "paid", fecha: "2025-11-07" },
        ]);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al cargar trabajos');
      
      setTrabajos([
        { jobId: "ERR-001", titulo: "Pago Ejemplo 1", descripcion: "Error al cargar, mostrando ejemplo", totalPagar: 100.00, paymentStatus: "pending", fecha: "2025-11-10" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (trabajo) => {
    console.log('💳 Abriendo modal para:', trabajo);
    setSelectedTrabajo(trabajo);
    setShowPaymentModal(true);
  };

  const handleClosePayment = (completed) => {
    console.log('🔒 Cerrando modal. Completado:', completed);
    setShowPaymentModal(false);
    setSelectedTrabajo(null);
    if (completed) fetchTrabajos();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando trabajos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Gestión de Trabajos y Pagos</h1>
          <p className="text-blue-200 text-sm mt-1">Fixer ID: {fixerId}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{trabajos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pagados</p>
                <p className="text-2xl font-bold">{trabajos.filter(t => t.paymentStatus === 'paid').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{trabajos.filter(t => t.paymentStatus === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Lista de Trabajos</h2>
          </div>

          <div className="divide-y">
            {trabajos.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <AlertCircle className="mx-auto mb-3" size={48} />
                <p>No hay trabajos registrados</p>
              </div>
            ) : (
              trabajos.map((trabajo) => (
                <div key={trabajo.jobId} className="px-6 py-5 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{trabajo.titulo}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          trabajo.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trabajo.paymentStatus === 'paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          {trabajo.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{trabajo.descripcion}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{trabajo.jobId}</span>
                        <span>•</span>
                        <span>{trabajo.fecha}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-gray-400" size={20} />
                        <span className="text-2xl font-bold">Bs. {trabajo.totalPagar.toFixed(2)}</span>
                      </div>
                      
                      {trabajo.paymentStatus === 'pending' ? (
                        <button
                          onClick={() => handleOpenPayment(trabajo)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md"
                        >
                          💰 Confirmar Pago
                        </button>
                      ) : (
                        <button disabled className="px-6 py-2.5 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                          ✓ Pagado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && selectedTrabajo && (
        <PaymentMethodCashFixer
          trabajo={selectedTrabajo}
          onClose={handleClosePayment}
          onBack={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
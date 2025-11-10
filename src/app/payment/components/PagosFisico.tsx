'use client';
import React, { useState, useEffect } from 'react';
import { Briefcase, DollarSign, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

// Modal de pago en efectivo (adaptado de tu segundo código)
function PaymentMethodCashFixer({ trabajo, onClose, onBack }) {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [loading, setLoading] = useState(true);
  const [patching, setPatching] = useState(false);
  const [mainMessage, setMainMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [unlockAtISO, setUnlockAtISO] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [wasLocked, setWasLocked] = useState(false);
  const [codeExpired, setCodeExpired] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [summary, setSummary] = useState(null);

  const msLeft = unlockAtISO ? Math.max(0, new Date(unlockAtISO).getTime() - now) : 0;
  const msUntilExpiration = codeExpiresAt ? Math.max(0, new Date(codeExpiresAt).getTime() - now) : 0;
  
  const minutesLeft = Math.floor(msLeft / 60000);
  const secondsLeft = Math.floor((msLeft % 60000) / 1000);
  const hoursUntilExpiration = Math.floor(msUntilExpiration / 3600000);
  const minutesUntilExpiration = Math.floor((msUntilExpiration % 3600000) / 60000);
  const secondsUntilExpiration = Math.floor((msUntilExpiration % 60000) / 1000);
  const locked = !!unlockAtISO && msLeft > 0;

  useEffect(() => {
    if (!unlockAtISO && !codeExpiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [unlockAtISO, codeExpiresAt]);

  useEffect(() => {
    if (wasLocked && !locked && unlockAtISO) {
      setMainMessage({
        type: 'success',
        text: '🔓 El periodo de bloqueo ha finalizado. Ya puedes intentar nuevamente.'
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
      setMainMessage({ type: 'error', text: 'No hay ID de trabajo para consultar.' });
      setLoading(false);
      return;
    }

    setMainMessage(null);
    setRemainingAttempts(null);
    setUnlockAtISO(null);
    setLoading(true);

  try {
      // Si el id parece un ObjectId, consultar backend real
      const isObjectId = typeof trabajo.jobId === 'string' && /^[a-fA-F0-9]{24}$/.test(trabajo.jobId);
      if (isObjectId) {
        const ts = Date.now();
        const res = await fetch(`/api/lab/payments/${trabajo.jobId}/summary?t=${ts}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const d = data?.data ?? data;
        const expiresAt = d?.codeExpiresAt ? String(d.codeExpiresAt) : null;
        const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
        setCodeExpiresAt(expiresAt);
        setCodeExpired(expired);
        setSummary({
          id: String(d?.id ?? trabajo.jobId),
          code: d?.code ?? null,
          status: d?.status ?? 'pending',
          amount: {
            total: typeof d?.total === 'number' ? d.total : (d?.amount?.total ?? 0),
            currency: d?.amount?.currency ?? d?.currency ?? 'BOB',
          },
        });
        setLoading(false);
        return;
      }
      // Simulación - reemplaza con tu endpoint real
      // const res = await fetch(`/api/trabajos/${trabajo.jobId}/payment-summary`);
      
      // Datos simulados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSummary({
        id: trabajo.jobId,
        code: null,
        status: trabajo.paymentStatus || "pending",
        amount: {
          total: trabajo.totalPagar || 0,
          currency: "BOB",
        },
      });
    } catch (e) {
      setMainMessage({ type: 'error', text: 'No se pudo cargar el resumen' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, [trabajo?.jobId]);

  const handleContinuar = async () => {
    if (!summary) return;

    const provided = codigoIngresado.trim();
    if (!provided) {
      setMainMessage({ type: 'error', text: 'Por favor, ingrese el código de 6 caracteres.' });
      return;
    }

    if (provided.length !== 6) {
      setMainMessage({ type: 'error', text: 'El código debe tener exactamente 6 caracteres.' });
      return;
    }

    setMainMessage(null);
    setPatching(true);

  try {
      // Si el id parece ObjectId (pago real), confirmar contra backend
      const isObjectId = typeof summary.id === 'string' && /^[a-fA-F0-9]{24}$/.test(summary.id);
      if (isObjectId) {
        const res = await fetch(`/api/lab/payments/${summary.id}/confirm`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: provided }),
        });
        const respData = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(respData?.error || 'Error al confirmar el pago');
        }
        setShowSuccessModal(true);
        setCodigoIngresado('');
        return;
      }
      // Simulación - reemplaza con tu endpoint real
      // const res = await fetch(`/api/trabajos/${summary.id}/confirm-payment`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ code: provided }),
      // });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulación de éxito
      setShowSuccessModal(true);
      setCodigoIngresado("");
      
    } catch (e) {
      setMainMessage({ type: 'error', text: 'Error al confirmar el pago' });
    } finally {
      setPatching(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onClose(true);
  };

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-black rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#16A34A] rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ✓ Código correcto! Pago confirmado
          </h2>
          <button
            onClick={handleCloseSuccessModal}
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
        <div className="bg-[#F9FAFB] rounded-lg shadow-xl px-8 py-6 max-w-md">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#2B31E0] mb-4" />
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
          <h1 className="text-xl font-semibold">Confirmar Pago en Efectivo</h1>
          <button
            onClick={() => onClose()}
            className="hover:bg-[#2B6AE0] px-3 py-1 rounded text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#111827]">Confirmación del pago recibido</h2>
          </div>

          {mainMessage && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className={`border-l-4 p-4 rounded ${
                mainMessage.type === 'error' ? 'bg-red-50 border-[#EF4444]' :
                mainMessage.type === 'warning' ? 'bg-amber-50 border-[#F59E0B]' :
                mainMessage.type === 'success' ? 'bg-green-50 border-[#16A34A]' :
                'bg-blue-50 border-[#759AE0]'
              }`}>
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
          )}

          {locked && (
            <div className="mb-6 max-w-xl mx-auto">
              <div className="bg-red-50 border border-[#EF4444] rounded p-3">
                <p className="text-red-700 text-sm font-medium text-center">
                  🔒 Cuenta bloqueada. Intenta en:{" "}
                  <b className="text-lg">
                    {minutesLeft > 0 ? `${minutesLeft}m ` : ""}
                    {secondsLeft}s
                  </b>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <label className="text-lg font-semibold text-[#111827] sm:w-48">
                Código de Trabajo
              </label>
              <input
                type="text"
                value={codigoIngresado}
                onChange={handleCodigoChange}
                placeholder="CODIGO"
                disabled={locked || patching || codeExpired}
                maxLength={6}
                className="flex-1 px-4 py-3 bg-white disabled:bg-[#E5E7EB] border-2 border-[#759AE0] rounded-md text-[#111827] text-lg focus:outline-none focus:ring-2 focus:ring-[#759AE0] disabled:cursor-not-allowed uppercase"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <label className="text-lg font-semibold text-[#111827] sm:w-48">
                Monto a Cobrar
              </label>
              <input
                type="text"
                value={`${summary.amount.total} ${summary.amount.currency}`}
                readOnly
                className="flex-1 px-4 py-3 bg-[#E5E7EB] border border-[#D1D5DB] rounded-md text-[#111827] text-lg"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <label className="text-lg font-semibold text-[#111827] sm:w-48">
                Estado
              </label>
              <input
                type="text"
                value={
                  summary.status === 'paid' ? 'CONFIRMADO' :
                  summary.status === 'failed' ? 'ERROR' :
                  'PENDIENTE'
                }
                readOnly
                className="flex-1 px-4 py-3 bg-[#E5E7EB] border border-[#D1D5DB] rounded-md text-[#111827] text-lg"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-12">
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
              onClick={onBack}
              disabled={patching}
              className="px-12 py-3 bg-[#2BDDE0] text-[#111827] text-lg font-semibold rounded-md hover:bg-[#5E2BE0] transition-colors disabled:opacity-60"
            >
              Volver
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            ID trabajo: <span className="font-mono text-[#64748B]">{summary.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal de lista de trabajos
export default function TrabajosYPagos() {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchTrabajos();
  }, []);

  const fetchTrabajos = async () => {
    setLoading(true);
    try {
      // Fallback: si no hay fixerId en storage, usar el fijo de prueba
      const DEFAULT_FIXER_ID = '68e87a9cdae3b73d8040102f';
      const rawFixerId = (typeof window !== 'undefined'
        ? (localStorage.getItem('fixerId') || localStorage.getItem('userId') || DEFAULT_FIXER_ID)
        : '');
      const fixerId = rawFixerId;
      if (typeof window !== 'undefined' && !localStorage.getItem('fixerId') && /^[a-fA-F0-9]{24}$/.test(fixerId)) {
        localStorage.setItem('fixerId', fixerId);
      }

      if (fixerId && /^[a-fA-F0-9]{24}$/.test(fixerId)) {
        const [pendingRes, paidRes] = await Promise.all([
          fetch(`/api/lab/payments/by-fixer/${fixerId}/summary?status=pending`, { cache: 'no-store' }),
          fetch(`/api/lab/payments/by-fixer/${fixerId}/summary?status=paid`, { cache: 'no-store' }),
        ]);
        const pJson = pendingRes.ok ? await pendingRes.json() : { data: [] };
        const dJson = paidRes.ok ? await paidRes.json() : { data: [] };
        const pending = Array.isArray(pJson?.data) ? pJson.data : [];
        const paid = Array.isArray(dJson?.data) ? dJson.data : [];

        const mapped = [...pending, ...paid].map((x: any) => ({
          jobId: String(x.id), // reutilizamos campo jobId como paymentId
          titulo: `Pago ${String(x.id).slice(-6)}`,
          descripcion: '',
          totalPagar: x.total,
          paymentStatus: x.status,
          fecha: x.codeExpiresAt ? new Date(x.codeExpiresAt).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
        }));
        setTrabajos(mapped);
        return;
      }

      // Fallback a datos simulados si no hay fixerId disponible
      await new Promise(resolve => setTimeout(resolve, 1000));
      const trabajosSimulados = [
        { jobId: "JOB-001", titulo: "Reparación de tubería", descripcion: "Reparación urgente de fuga en cocina", totalPagar: 250.00, paymentStatus: "pending", fecha: "2025-11-08" },
        { jobId: "JOB-002", titulo: "Instalación eléctrica", descripcion: "Instalación de toma corriente adicional", totalPagar: 180.50, paymentStatus: "paid", fecha: "2025-11-07" },
        { jobId: "JOB-003", titulo: "Pintura de sala", descripcion: "Pintura completa de sala de estar", totalPagar: 450.00, paymentStatus: "pending", fecha: "2025-11-09" },
        { jobId: "JOB-004", titulo: "Limpieza profunda", descripcion: "Limpieza post construcción", totalPagar: 320.00, paymentStatus: "paid", fecha: "2025-11-06" },
      ];
      setTrabajos(trabajosSimulados);
    } catch (error) {
      console.error('Error al cargar trabajos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (trabajo) => {
    console.log('Abriendo modal de pago para:', trabajo);
    setSelectedTrabajo(trabajo);
    setShowPaymentModal(true);
  };

  const handleClosePayment = (paymentCompleted) => {
    console.log('Cerrando modal. Pago completado:', paymentCompleted);
    setShowPaymentModal(false);
    setSelectedTrabajo(null);
    if (paymentCompleted) {
      fetchTrabajos(); // Recargar lista si se completó el pago
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle size={16} />
          Pagado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock size={16} />
        Pendiente
      </span>
    );
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
      {/* Header */}
      <div className="bg-[#2B31E0] text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Gestión de Trabajos y Pagos</h1>
          <p className="text-blue-200 text-sm mt-1">Administra tus trabajos y confirma pagos</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Trabajos</p>
                <p className="text-2xl font-bold text-gray-800">{trabajos.length}</p>
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
                <p className="text-2xl font-bold text-gray-800">
                  {trabajos.filter(t => t.paymentStatus === 'paid').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-800">
                  {trabajos.filter(t => t.paymentStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de trabajos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Lista de Trabajos</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {trabajos.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <AlertCircle className="mx-auto mb-3 text-gray-400" size={48} />
                <p>No hay trabajos registrados</p>
              </div>
            ) : (
              trabajos.map((trabajo) => (
                <div
                  key={trabajo.jobId}
                  className="px-6 py-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del trabajo */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {trabajo.titulo}
                        </h3>
                        {getStatusBadge(trabajo.paymentStatus)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{trabajo.descripcion}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">ID: {trabajo.jobId}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Fecha: {trabajo.fecha}</span>
                      </div>
                    </div>

                    {/* Monto y acción */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:text-right">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-gray-400" size={20} />
                        <span className="text-2xl font-bold text-gray-800">
                          Bs. {trabajo.totalPagar.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="w-full sm:w-auto">
                        {trabajo.paymentStatus === 'pending' ? (
                          <button
                            onClick={() => handleOpenPayment(trabajo)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#2B31E0] hover:bg-[#2B6AE0] text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                          >
                            💰 Confirmar Pago
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                          >
                            ✓ Ya Pagado
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de pago */}
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

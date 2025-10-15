"use client";

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentMethodUI from './PaymentMethodUI';
import CardList from './CardList';
import { createCashPayment } from '../service/payments';

const stripePromise = loadStripe(
  'pk_test_51SIL9sCiQE1vT29jMXy7gnJ1N2VvGHHvLLPyhlVqEWoCGLhsQJXcR4ZtROYiJgiezETeTV2B67cGaoGHuXPJwnCp003Ix0t5oI',
);

export default function PaymentDemo() {
  const [trabajos, setTrabajos] = useState([
    { id: 1, estado: 'Sin Pagar', monto: 500 },
    { id: 2, estado: 'Sin Pagar', monto: 100 },
    { id: 3, estado: 'Sin Pagar', monto: 200 },
  ]);

  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [showCashPayment, setShowCashPayment] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [selectedTrabajo, setSelectedTrabajo] = useState<any>(null);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);

  // Datos para pago con tarjeta
  const requesterId = '68ed47b64ed596d659c1ed8f';
  const fixerId = '68ef1be7be38c7f1c3c2c78b';
  const jobId = '68ea51ee0d80087528ad803f';
  const amount = 78;

  const agregarTrabajo = () => {
    const nuevoId = trabajos.length > 0 ? Math.max(...trabajos.map((t) => t.id)) + 1 : 1;
    const montoAleatorio = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
    setTrabajos(prev => [...prev, { id: nuevoId, estado: 'Sin Pagar', monto: montoAleatorio }]);
  };

  const handlePagar = (trabajo: any) => {
    setSelectedTrabajo(trabajo);
    setShowPaymentSelector(true);
  };

  const handleSelectPaymentMethod = (method: string) => {
    if (method === 'cash') {
      setShowPaymentSelector(false);
      setShowCashPayment(true);
    } else if (method === 'card') {
      setShowPaymentSelector(false);
      setShowCardPayment(true);
    } else {
      setShowPaymentSelector(false);
    }
  };

  const handleCloseCashPayment = () => {
    setShowCashPayment(false);
    setSelectedTrabajo(null);
    setCreatedPaymentId(null);
  };

  const handleCloseCardPayment = () => {
    setShowCardPayment(false);
    setSelectedTrabajo(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Demo de pagos</h1>
      </div>

      {/* Buttons Section */}
      <div className="p-6 flex items-center gap-4">
        <button
          onClick={agregarTrabajo}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium"
        >
          <span className="text-2xl">🔧</span>
          Agregar Trabajo
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium">
          <span className="text-2xl">🏦</span>
          Agregar cuenta bancaria
        </button>
        <div className="ml-auto bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium">
          Estado: SCB
        </div>
      </div>

      {/* Table */}
      <div className="px-6">
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-blue-600">
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">
                Nro Trabajo
              </th>
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">
                Estado
              </th>
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">
                Monto
              </th>
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">
                Pagar
              </th>
            </tr>
          </thead>
          <tbody>
            {trabajos.map((trabajo) => (
              <tr key={trabajo.id} className="bg-white">
                <td className="border-2 border-black px-4 py-4 text-xl text-gray-800">
                  {trabajo.id}
                </td>
                <td className="border-2 border-black px-4 py-4 text-xl text-gray-800">
                  {trabajo.estado}
                </td>
                <td className="border-2 border-black px-4 py-4 text-xl text-right text-gray-800">
                  {trabajo.monto}
                </td>
                <td className="border-2 border-black px-4 py-4 text-center">
                  <button
                    onClick={() => handlePagar(trabajo)}
                    className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-2 rounded text-lg font-semibold"
                  >
                    PAGAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selector */}
      {showPaymentSelector && (
        <PaymentMethodSelector
          onSelectMethod={handleSelectPaymentMethod}
          onClose={() => setShowPaymentSelector(false)}
          trabajo={selectedTrabajo}
          onAfterPostCash={() => {
            setShowPaymentSelector(false);
            setShowCashPayment(true);
          }}
          setCreatedPaymentId={setCreatedPaymentId}
        />
      )}

      {/* Cash Payment Modal */}
      {showCashPayment && (
        <PaymentMethodUI
          paymentId={createdPaymentId}
          onClose={handleCloseCashPayment}
        />
      )}

      {/* Card Payment Modal */}
      {showCardPayment && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseCardPayment}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-3xl font-bold"
            >
              ✕
            </button>

            <Elements stripe={stripePromise}>
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Selecciona tu tarjeta o agrega una nueva
                </h2>

                <CardList
                  requesterId={requesterId}
                  fixerId={fixerId}
                  jobId={jobId}
                  amount={amount}
                />
              </div>
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
}

/** ——— Selector ——— */
function PaymentMethodSelector({
  onSelectMethod,
  onClose,
  trabajo,
  onAfterPostCash,
  setCreatedPaymentId,
}: {
  onSelectMethod: (m: string) => void;
  onClose: () => void;
  trabajo: any;
  onAfterPostCash?: () => void;
  setCreatedPaymentId: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // POST al pulsar "Pago Efectivo"
  const handlePayCash = async () => {
    setErr(null);
    setOkMsg(null);
    setLoading(true);
    try {
      const payload = {
        jobId: "66fabc1234567890abc12345",
        payerId: "66fdef1234567890abc12345",
        subTotal: Number(trabajo?.monto || 0),
        service_fee: 0,
        discount: 0,
        currency: "BOB",
        paymentMethod: "Efectivo",
      };
      const resp = await createCashPayment(payload);
      const created = resp?.data || resp?.payment || resp;
      const newId = created?._id;
      if (!newId) throw new Error('No llegó _id del pago creado');

      setCreatedPaymentId(newId);
      setOkMsg('✅ Pago creado');
      onAfterPostCash?.();
    } catch (e: any) {
      console.error(e);
      setErr(e.message ?? 'Error al crear el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl mx-4 rounded-lg shadow-xl">
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-semibold">Demo de pagos</h2>
        </div>

        <div className="p-12">
          <h3 className="text-3xl font-semibold text-center mb-12 text-gray-900">
            Seleccione su método de pago preferido
          </h3>

          <div className="space-y-6 max-w-xl mx-auto">
            <button
              onClick={() => onSelectMethod('card')}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-lg flex items-center gap-4 text-2xl font-medium"
            >
              <span className="text-3xl">💳</span>
              Tarjeta de Crédito
            </button>

            <button className="w-full bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-lg flex items-center gap-4 text-2xl font-medium">
              <span className="text-3xl">⊞</span>
              Pago QR
            </button>

            <button
              onClick={handlePayCash}
              disabled={loading}
              className="w-full bg-blue-400 hover:bg-blue-500 disabled:opacity-60 text-white px-8 py-4 rounded-lg flex items-center gap-4 text-2xl font-medium"
            >
              <span className="text-3xl">💵</span>
              {loading ? 'Creando…' : 'Pago Efectivo'}
            </button>

            {err && <p className="text-red-600 text-center">{err}</p>}
            {okMsg && <p className="text-green-700 text-center">{okMsg}</p>}
          </div>

          <div className="flex justify-end mt-12">
            <button
              onClick={onClose}
              className="bg-cyan-400 hover:bg-cyan-500 text-white px-12 py-3 rounded-lg text-xl font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
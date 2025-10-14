"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PaymentMethodUI from './PaymentMethodUI';

export default function PaymentDemo() {
  const router = useRouter();
  const [hasAccount, setHasAccount] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasBankAcct = sessionStorage.getItem('hasBankAccount') === 'true';
      setHasAccount(hasBankAcct);
    }
  }, []);
  
  const handleAgregarCuenta = () => {
    router.push('/registro-cuenta');
  };

  const [trabajos, setTrabajos] = useState([
    { id: 1, estado: 'Sin Pagar', monto: 500 },
    { id: 2, estado: 'Sin Pagar', monto: 100 },
    { id: 3, estado: 'Sin Pagar', monto: 200 },
  ]);

  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [showCashPayment, setShowCashPayment] = useState(false);
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);

  const agregarTrabajo = () => {
    const nuevoId = trabajos.length > 0 ? Math.max(...trabajos.map(t => t.id)) + 1 : 1;
    const montoAleatorio = Math.floor(Math.random() * (500 - 100 + 1)) + 100;

    setTrabajos([...trabajos, {
      id: nuevoId,
      estado: 'Sin Pagar',
      monto: montoAleatorio
    }]);
  };

  const handlePagar = (trabajo) => {
    setSelectedTrabajo(trabajo);
    setShowPaymentSelector(true);
  };

  const handleSelectPaymentMethod = (method) => {
    if (method === 'cash') {
      setShowPaymentSelector(false);
      setShowCashPayment(true);
    } else {
      setShowPaymentSelector(false);
    }
  };

  const handleCloseCashPayment = () => {
    setShowCashPayment(false);
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

        <button
          onClick={handleAgregarCuenta}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium"
        >
          <span className="text-2xl">🏦</span>
          Agregar cuenta bancaria
        </button>

        <div className="ml-auto bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium">
          Estado: {hasAccount ? 'CCB' : 'SCB'}
        </div>
      </div>

      {/* Table */}
      <div className="px-6">
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-blue-600">
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">Nro Trabajo</th>
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">Estado</th>
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">Monto</th>
              <th className="border-2 border-black px-4 py-3 text-left text-2xl font-bold text-white">Pagar</th>
            </tr>
          </thead>
          <tbody>
            {trabajos.map((trabajo) => (
              <tr key={trabajo.id} className="bg-white">
                <td className="border-2 border-black px-4 py-4 text-xl text-gray-800">{trabajo.id}</td>
                <td className="border-2 border-black px-4 py-4 text-xl text-gray-800">{trabajo.estado}</td>
                <td className="border-2 border-black px-4 py-4 text-xl text-right text-gray-800">{trabajo.monto}</td>
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

      {/* Payment Method Selector Modal */}
      {showPaymentSelector && (
        <PaymentMethodSelector
          onSelectMethod={handleSelectPaymentMethod}
          onClose={() => setShowPaymentSelector(false)}
          trabajo={selectedTrabajo}
        />
      )}

      {/* Cash Payment Modal */}
      {showCashPayment && (
        <PaymentMethodUI
          trabajo={selectedTrabajo}
          onClose={handleCloseCashPayment}
        />
      )}
    </div>
  ); 

function PaymentMethodSelector({ onSelectMethod, onClose, trabajo }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl mx-4 rounded-lg shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-semibold">Demo de pagos</h2>
        </div>

        {/* Content */}
        <div className="p-12">
          <h3 className="text-3xl font-semibold text-center mb-12 text-gray-900">
            Seleccione su metodo de pago preferido
          </h3>

          <div className="space-y-6 max-w-xl mx-auto">
            <button className="w-full bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-lg flex items-center gap-4 text-2xl font-medium">
              <span className="text-3xl">💳</span>
              Tarjeta de Credito
            </button>

            <button className="w-full bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-lg flex items-center gap-4 text-2xl font-medium">
              <span className="text-3xl">⊞</span>
              Pago QR
            </button>

            <button
              onClick={() => onSelectMethod('cash')}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-lg flex items-center gap-4 text-2xl font-medium"
            >
              <span className="text-3xl">💵</span>
              Pago Efectivo
            </button>
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
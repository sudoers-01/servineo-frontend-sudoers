"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, CreditCard, QrCode, Building2 } from 'lucide-react';
import WalletFlagWatcher from "../components/WalletFlagWatcher";


// Datos de ejemplo (en producción vienen del backend)
const MOCK_FIXER_DATA = {
  fixerId: "68e8e7a9cdae3b73d8040102f",
  wallet: {
    balance: 13.00,
    currency: "BOB"
  },
  recentTransactions: [
    {
      _id: "1",
      type: "deposit",
      amount: 50.00,
      description: "Recargar con Tarjeta",
      createdAt: "2025-10-25",
      status: "completed"
    },
    {
      _id: "2",
      type: "commission",
      amount: -2.50,
      description: "Comision - Trabajo #1234 (Efectivo)",
      jobId: "1234",
      createdAt: "2025-10-24",
      status: "completed"
    },
    {
      _id: "3",
      type: "commission",
      amount: -3.75,
      description: "Comision - Trabajo #1228 (Efectivo)",
      jobId: "1228",
      createdAt: "2025-10-23",
      status: "completed"
    }
  ],
  allTransactions: [
    {
      _id: "1",
      type: "deposit",
      amount: 50.00,
      description: "Recarga con Tarjeta",
      method: "Recarga con Tarjeta",
      createdAt: "2025-10-25",
      status: "completed"
    },
    {
      _id: "2",
      type: "commission",
      amount: -2.50,
      description: "Comision - Trabajo #1234 (Efectivo)",
      jobId: "1234",
      metadata: {
        userPaidAmount: 50.00,
        serviceFee: 2.50
      },
      createdAt: "2025-10-24",
      status: "completed"
    },
    {
      _id: "3",
      type: "commission",
      amount: -3.75,
      description: "Comision - Trabajo #1228 (Efectivo)",
      jobId: "1228",
      metadata: {
        userPaidAmount: 75.00,
        serviceFee: 3.75
      },
      createdAt: "2025-10-23",
      status: "completed"
    },
    {
      _id: "4",
      type: "deposit",
      amount: 100.00,
      description: "Recarga con QR",
      method: "Recarga con QR",
      createdAt: "2025-10-20",
      status: "completed"
    }
  ]
};

export default function FixerWalletApp() {
  const [screen, setScreen] = useState<'wallet' | 'recharge' | 'history'>('wallet');
  const [amount, setAmount] = useState('0.00');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const router = useRouter();
  const [receivedFixerId, setReceivedFixerId] = useState<string | null>(null);

  useEffect(() => {
    // Esperamos a que el router esté listo
    if (router.isReady) {
      const { fixerId } = router.query;
      if (fixerId) {
        setReceivedFixerId(fixerId as string);
        // En un futuro, aquí llamarías a tu backend:
        // fetchWalletData(fixerId);
      } else {
        console.warn("No se recibió fixerId en la URL.");
      }
    }
  }, [router.isReady, router.query]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toFixed(2));
  };

  const formatCurrency = (value: number) => {
    return `Bs. ${Math.abs(value).toFixed(2)}`;
  };

  // Pantalla 1: Wallet Principal
  if (screen === 'wallet') {
    return (
      <div className="min-h-screen bg-balck-100">
      <WalletFlagWatcher fixerId={receivedFixerId ?? "68e87a9cdae3b73d8040102f"} pollMs={4000} />
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">Fixer Wallet</h1>
        </div>

        {/* Balance Card */}
        <div className="p-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} />
              <span className="text-sm opacity-90">Saldo Actual</span>
            </div>
            <div className="text-5xl font-bold mb-6">
              Bs. {MOCK_FIXER_DATA.wallet.balance.toFixed(2)}
            </div>
            <button
              onClick={() => setScreen('recharge')}
              className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Recargar Saldo
            </button>
          </div>
        </div>

        {/* Movimientos Recientes */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-600 font-semibold text-lg">Movientos Recientes</h2>
            <button
              onClick={() => setScreen('history')}
              className="text-blue-600 font-semibold"
            >
              Ver todo
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_FIXER_DATA.recentTransactions.map((tx) => (
              <div key={tx._id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {tx.amount > 0 ? (
                    <TrendingUp className="text-green-600" size={24} />
                  ) : (
                    <TrendingDown className="text-red-600" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{tx.description}</p>
                  <p className="text-sm text-gray-500">{tx.createdAt}</p>
                </div>
                <div className={`font-bold text-lg ${
                  tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pantalla 2: Recargar Saldo
  if (screen === 'recharge') {
    return (
      <div className="min-h-screen bg-gray-100">
        <WalletFlagWatcher fixerId={receivedFixerId ?? "68e87a9cdae3b73d8040102f"} pollMs={4000} />
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">Recargar Saldo</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Monto */}
          <div>
            <label className="block text-gray-900 font-semibold text-lg mb-2">
              Monto a recargar (Bs.)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-2xl font-semibold focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          {/* Montos rápidos */}
          <div className="grid grid-cols-4 gap-3">
            {[20, 50, 100, 200].map((value) => (
              <button
                key={value}
                onClick={() => handleQuickAmount(value)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 py-3 rounded-lg font-bold text-xl transition-colors"
              >
                {value}
              </button>
            ))}
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-gray-900 font-semibold text-lg mb-3">
              Metodo de Pago
            </label>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedMethod('card')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <CreditCard size={28} className="text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">Tarjeta de Credito</span>
              </button>

              <button
                onClick={() => setSelectedMethod('qr')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'qr'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <QrCode size={28} className="text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">Pago QR</span>
              </button>

              <button
                onClick={() => setSelectedMethod('transfer')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'transfer'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <Building2 size={28} className="text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">Transferencia Bancaria</span>
              </button>
            </div>
          </div>

          {/* Botón Volver */}
          <button
            onClick={() => setScreen('wallet')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Pantalla 3: Historial Completo
  return (
    <div className="min-h-screen bg-gray-100">
      <WalletFlagWatcher fixerId={receivedFixerId ?? "68e87a9cdae3b73d8040102f"} pollMs={4000} />
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => setScreen('wallet')}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Historial de Movimientos</h1>
      </div>

      {/* Balance */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1">Saldo Actual</p>
            <p className="text-blue-600 text-3xl font-bold">
              Bs. {MOCK_FIXER_DATA.wallet.balance.toFixed(2)}
            </p>
          </div>
          <Wallet size={32} className="text-blue-600" />
        </div>
      </div>

      {/* Todos los movimientos */}
      <div className="px-6">
        <h2 className="text-gray-700 font-semibold mb-4">Todos los Movimientos</h2>
        <div className="space-y-4">
          {MOCK_FIXER_DATA.allTransactions.map((tx) => (
            <div key={tx._id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {tx.amount > 0 ? (
                    <TrendingUp className="text-green-600" size={24} />
                  ) : (
                    <TrendingDown className="text-red-600" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-gray-900">
                      {tx.type === 'deposit' ? 'Recarga' : 'Deducción de Comisión'}
                    </p>
                    <p className={`font-bold text-lg whitespace-nowrap ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {tx.type === 'deposit' ? tx.method : tx.description}
                  </p>
                  {tx.jobId && (
                    <button className="text-blue-600 text-sm font-semibold hover:underline">
                      Trabajo #{tx.jobId}
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{tx.createdAt}</p>
                  
                  {/* Info de comisión */}
                  {tx.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Comisión SERVINEO:</span> 5% del trabajo pagado en efectivo
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// src/app/payment/FixerWallet/history/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

// --- Tus datos de MOCK ---
const MOCK_FIXER_DATA = {
  wallet: { balance: 13.00, currency: "BOB" },
  allTransactions: [
    { _id: "1", type: "deposit", amount: 50.00, description: "Recarga con Tarjeta", method: "Recarga con Tarjeta", createdAt: "2025-10-25", status: "completed" },
    { _id: "2", type: "commission", amount: -2.50, description: "Comision - Trabajo #1234 (Efectivo)", jobId: "1234", metadata: { userPaidAmount: 50.00, serviceFee: 2.50 }, createdAt: "2025-10-24", status: "completed" },
    { _id: "3", type: "commission", amount: -3.75, description: "Comision - Trabajo #1228 (Efectivo)", jobId: "1228", metadata: { userPaidAmount: 75.00, serviceFee: 3.75 }, createdAt: "2025-10-23", status: "completed" },
    { _id: "4", type: "deposit", amount: 100.00, description: "Recarga con QR", method: "Recarga con QR", createdAt: "2025-10-20", status: "completed" }
  ]
};
// --- Fin de Mocks ---

export default function FixerWalletHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [receivedFixerId, setReceivedFixerId] = useState<string | null>(null);

  // Aquí cargarías los datos del Fixer usando el ID
  const [walletData, setWalletData] = useState(MOCK_FIXER_DATA);

  useEffect(() => {
    // <-- Lee el fixerId de la URL para saber qué historial mostrar
    const fixerId = searchParams.get('fixerId');
    if (fixerId) {
      setReceivedFixerId(fixerId);
      console.log("Fixer ID Recibido en Historial:", fixerId);
      // En un futuro, aquí llamarías a tu backend:
      // fetchHistoryData(fixerId).then(data => setWalletData(data));
    }
  }, [searchParams]);

  const formatCurrency = (value: number) => {
    return `Bs. ${Math.abs(value).toFixed(2)}`;
  };

  // Pantalla 3: Historial Completo
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()}>
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
              Bs. {walletData.wallet.balance.toFixed(2)}
            </p>
          </div>
          <Wallet size={32} className="text-blue-600" />
        </div>
      </div>

      {/* Todos los movimientos */}
      <div className="px-6 pb-6">
        <h2 className="text-gray-700 font-semibold mb-4">Todos los Movimientos</h2>
        <div className="space-y-4">
          {walletData.allTransactions.map((tx) => (
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
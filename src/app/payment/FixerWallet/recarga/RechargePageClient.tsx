'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, QrCode, Building2, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import TransferBank from './TransferBank';
import CardListFixer from './CardListFixer';

// Stripe público
const stripePromise = loadStripe(
  'pk_test_51SHGq0Fp8K0s2pYx4l5z1fkIcXSouAknc9gUV6PpYKR8TjexmaC3OiJR9jNIa09e280Pa6jGVRA6ZNY7kSCCGcLt002CEmfDnU',
);

export default function FixerWalletRecharge({ userid }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [receivedFixerId, setReceivedFixerId] = useState<string | null>(null);
  const [amount, setAmount] = useState('0.00');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [screen, setScreen] = useState<'main' | 'transfer'>('main');

  // Servineo receptor (para QR y tarjeta)
  const servineoId = '68f7c764495b9ef8a357c40b';

  useEffect(() => {
    const fixerId = searchParams.get('fixerId');
    if (fixerId) {
      setReceivedFixerId(fixerId);
      console.log('Fixer ID recibido para recarga:', fixerId);
    }
  }, [searchParams]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toFixed(2));
  };

  const handleCloseCardPayment = (paymentCompleted?: boolean) => {
    if (paymentCompleted) {
      alert('✅ Recarga realizada con éxito.');
      router.back();
    }
    setShowCardPayment(false);
  };

  const isValidAmount = () => {
    const num = Number(amount);
    return !isNaN(num) && num > 0;
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (amount === '0.00') setAmount('');
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (amount === '' || amount === '.') setAmount('0.00');
  };

  //inicio de la mejora
  const [amountError, setAmountError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Permitir solo números y hasta 2 decimales
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

    // Extraer parte entera antes del punto
    const integerPart = value.split('.')[0];

    // Validar máximo 4 dígitos
    if (integerPart.length > 4) {
      setAmountError('El monto máximo permitido es de 4 dígitos.');
      return;
    }

    // Si está OK
    setAmountError('');
    setAmount(value);
  };

  //fin de la mejora

  // Pantalla principal
  if (screen === 'main') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
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
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full px-4 py-4 border-2 text-black border-gray-300 rounded-lg text-2xl font-semibold focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
            />
            {/* inicio de cambios*/}
            {amountError && <p className="text-red-500 text-sm mt-1">{amountError}</p>}
            {/* fin de cambios */}
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

          {/* Métodos de Pago */}
          <div>
            <label className="block text-gray-900 font-semibold text-lg mb-3">Método de Pago</label>
            <div className="space-y-3">
              {/* 💳 Tarjeta */}
              <button
                onClick={() => {
                  if (!isValidAmount()) {
                    alert('Por favor ingresa un monto válido mayor a cero.');
                    return;
                  }
                  setSelectedMethod('card');
                  setShowCardPayment(true);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <CreditCard size={28} className="text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">Tarjeta de Crédito</span>
              </button>

              {/* ⊞ QR */}
              <button
                onClick={() => {
                  if (!isValidAmount()) {
                    alert('Por favor ingresa un monto válido mayor a cero.');
                    return;
                  }
                  setSelectedMethod('qr');
                  const bookingId = 'recarga';
                  router.push(
                    `/payment/qrwallet?fixerId=${receivedFixerId}&amount=${Number(
                      amount,
                    )}&currency=BOB&type=wallet&providerId=${servineoId}&bookingId=${bookingId}`,
                  );
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'qr'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <QrCode size={28} className="text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">Pago QR</span>
              </button>

              {/* 🏦 Transferencia */}
              <button
                onClick={() => {
                  if (!isValidAmount()) {
                    alert('Por favor ingresa un monto válido mayor a cero.');
                    return;
                  }
                  setSelectedMethod('transfer');
                  setScreen('transfer');
                }}
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
            onClick={() => router.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Volver
          </button>
        </div>

        {/* 💳 Modal Tarjeta */}
        {showCardPayment && (
          <div
            className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4"
            onClick={() => handleCloseCardPayment(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto relative"
            >
              <button
                onClick={() => handleCloseCardPayment(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-3xl font-bold transition-colors"
              >
                ✕
              </button>

              <Elements stripe={stripePromise}>
                <div className="flex flex-col items-center justify-center gap-6">
                  <h2 className="text-2xl font-bold text-center text-gray-900">
                    Selecciona tu tarjeta o agrega una nueva
                  </h2>

                  <CardListFixer
                    fixerId={userid}
                    amount={amount}
                    onRechargeSuccess={() => handleCloseCardPayment(true)}
                  />
                </div>
              </Elements>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 🏦 Pantalla de transferencia bancaria
  if (screen === 'transfer') {
    return (
      <TransferBank
        fixerId={receivedFixerId!}
        amount={Number(amount)}
        servineoId={servineoId}
        onBack={() => setScreen('main')}
      />
    );
  }

  return null;
}

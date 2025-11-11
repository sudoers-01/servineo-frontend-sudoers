'use client';
import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';

interface AddCardModalFixerProps {
  userId: string;
  fixerId: string;
  jobId: string;
  amount: number;
  onClose: () => void;
  onCardAdded: () => void;
}

export default function AddCardModalFixer({
  userId,
  fixerId,
  jobId,
  amount,
  onClose,
  onCardAdded,
}: AddCardModalFixerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [saveCard, setSaveCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isValidHolder, setIsValidHolder] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const regex = /^(?=.*[a-zA-ZñÑáéíóúÁÉÍÓÚ])[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{3,50}$/;
    setIsValidHolder(regex.test(cardHolder.trim()));
  }, [cardHolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setErrorMessage('Stripe aún no está listo, espera unos segundos.');
      return;
    }
    if (!isValidHolder) {
      setErrorMessage('Nombre de titular inválido.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('No se pudo obtener la tarjeta. Recarga la página e inténtalo de nuevo.');
      setLoading(false);
      return;
    }

    try {
      // Creamos método de pago temporalmente para obtener detalles de la tarjeta
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: cardHolder },
      });
      if (error) throw new Error(error.message);

      // Guardar la tarjeta si el usuario lo desea
      if (saveCard) {
        const res = await fetch('https://servineo-backend-m68a.onrender.com/api/cardscreate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            paymentMethodId: paymentMethod.id,
            cardholderName: cardHolder,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar la tarjeta');
        console.log('💾 Tarjeta guardada:', data);
      }

      cardElement.clear();
      setCardHolder('');
      setSuccessMessage(saveCard ? 'Tarjeta guardada exitosamente ' : 'Tarjeta validada exitosamente ');

      // Esperamos un poco antes de cerrar
      setTimeout(() => {
        setSuccessMessage('');
        onCardAdded();
        onClose();
      }, 1500);

    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-[#2B6AE0] text-black p-6 rounded-2xl shadow-2xl w-96 relative"
      >
        <h2 className="text-xl font-bold mb-3 text-center">Agregar nueva tarjeta</h2>
        <p className="text-center mb-4 text-black">
          Esta tarjeta servirá para futuras recargas de tu wallet 💰
        </p>

        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 mb-4 rounded-md text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-black">
              Nombre de titular*
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full bg-[#E5E7EB] border-gray-200 rounded-xl px-3 py-2 text-black outline-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-[#E5E7EB] border text-black border-gray-700">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#000',
                    '::placeholder': { color: '#888' },
                  },
                  invalid: { color: '#ff6b6b' },
                },
              }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-black mt-2">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="accent-blue-500"
            />
            Guardar tarjeta para futuras recargas
          </label>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#D1D5DB] hover:bg-[#2BDDE0] rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!stripe || loading || !isValidHolder}
              className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                !stripe || loading || !isValidHolder
                  ? 'bg-[#D1D5DB] cursor-not-allowed'
                  : 'bg-[#D1D5DB] hover:bg-[#2BDDE0]'
              }`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Éxito */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 bg-[#2BDDE0] text-white px-6 py-3 rounded-xl shadow-xl text-center"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

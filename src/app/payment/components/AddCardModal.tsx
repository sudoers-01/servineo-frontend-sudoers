'use client';
import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';

// --- INICIO DE LA CORRECCIÓN ---

// 1. Definir la interfaz para las props
interface OnCardAddedPayload {
  payment: {
    _id: string;
    amount: number;
    card: { _id: string } | null;
  };
  cardSaved: boolean;
}

// 2. Define la interfaz para las props del modal
interface AddCardModalProps {
  userId: string;
  fixerId: string;
  jobId: string;
  amount: number;
  onClose: () => void;
  // 3. Usa el tipo de payload específico en lugar de 'any'
  onCardAdded: (payload: OnCardAddedPayload) => void; 
}

// --- FIN DE LA CORRECCIÓN ---

// 4. Aplica la interfaz a tus props (esto ya deberías tenerlo)
export default function AddCardModal({ 
  userId, 
  fixerId, 
  jobId, 
  amount, 
  onClose, 
  onCardAdded 
}: AddCardModalProps) {
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

  // 3. Tipar el evento 'e'
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
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: cardHolder },
      });
      if (error) throw new Error(error.message);

      let cardId = null;
      if (saveCard) {
        const cardRes = await fetch('http://localhost:4000/api/cardscreate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            paymentMethodId: paymentMethod.id,
            saveCard,
            cardholderName: cardHolder,
          }),
        });
        const savedCard = await cardRes.json();
        if (!cardRes.ok) throw new Error(savedCard.error || 'Error al guardar la tarjeta');
        cardId = savedCard._id;
      }

      const paymentRes = await fetch('http://localhost:4000/api/createpayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: userId,
          fixerId,
          jobId,
          cardId: cardId || null,
          paymentMethodId: saveCard ? undefined : paymentMethod.id,
          amount,
        }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.error || 'Error al crear el pago');

      onCardAdded({
        payment: {
          _id: paymentData.payment._id,
          amount: paymentData.payment.amount,
          card: cardId ? { _id: cardId } : null,
        },
        cardSaved: saveCard,
      });

      cardElement.clear();
      setCardHolder('');
      setSuccessMessage(
        saveCard ? 'Pago realizado exitosamente y tarjeta guardada' : 'Pago realizado exitosamente',
      );

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);

    // 4. Tipar el error 'err'
    } catch (err: unknown) { 
      console.error(err);
      // Comprobar si 'err' es un Error para acceder a 'message'
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocurrió un error inesperado.');
      }
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
        <h2 className="text-xl font-bold mb-3 text-center"> Agregar nueva tarjeta</h2>
        <p className="text-center mb-4 text-black">
          Monto a pagar: <strong className="text-[#2BDDE0]">{amount} BOB</strong>
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
                    color: '#000', // <-- texto negro
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
            Guardar tarjeta para futuros pagos
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
              {loading ? 'Procesando...' : 'Pagar'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Modal de éxito */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.6, ease: 'easeIn' } }}
            className="absolute top-10 bg-[#2BDDE0] text-white px-6 py-3 rounded-xl shadow-xl text-center"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
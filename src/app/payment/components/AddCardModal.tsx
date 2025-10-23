"use client";
import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";

export default function AddCardModal({ userId, fixerId, jobId, amount, onClose, onCardAdded }) {
  const stripe = useStripe();
  const elements = useElements();
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isValidHolder, setIsValidHolder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const regex = /^[a-zA-Z\s]{3,50}$/;
    setIsValidHolder(regex.test(cardHolder));
  }, [cardHolder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setErrorMessage("Stripe aún no está listo, espera unos segundos.");
      return;
    }
    if (!isValidHolder) {
      setErrorMessage("Nombre de titular inválido.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("No se pudo obtener la tarjeta. Recarga la página e inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: cardHolder },
      });
      if (error) throw new Error(error.message);

      let cardId = null;
      if (saveCard) {
        const cardRes = await fetch("http://localhost:4000/api/cardscreate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, paymentMethodId: paymentMethod.id, saveCard, cardholderName:cardHolder }),
        });
        const savedCard = await cardRes.json();
        if (!cardRes.ok) throw new Error(savedCard.error || "Error al guardar la tarjeta");
        cardId = savedCard._id;
      }

      const paymentRes = await fetch("http://localhost:4000/api/createpayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!paymentRes.ok) throw new Error(paymentData.error || "Error al crear el pago");

      onCardAdded({
        payment: {
          _id: paymentData.payment._id,
          amount: paymentData.payment.amount,
          card: cardId ? { _id: cardId } : null,
        },
      });

      cardElement.clear();
      setCardHolder("");
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
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
        className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-2xl w-96 relative"
      >
        <h2 className="text-xl font-bold mb-3 text-center"> Agregar nueva tarjeta</h2>
        <p className="text-center mb-4 text-gray-300">
          Monto a pagar: <strong className="text-green-400">{amount} BOB</strong>
        </p>

        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 mb-4 rounded-md text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-200">
              Nombre de titular*
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-gray-800 border border-gray-700">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#fff",
                    "::placeholder": { color: "#888" },
                  },
                  invalid: { color: "#ff6b6b" },
                },
              }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300 mt-2">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={() => setSaveCard(!saveCard)}
              className="accent-blue-500"
            />
            Guardar tarjeta para futuros pagos
          </label>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!stripe || loading || !isValidHolder}
              className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                (!stripe || loading || !isValidHolder)
                  ? "bg-blue-400/50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Procesando..." : "Pagar"}
            </button>
          </div>
        </form>
      </motion.div>

      {/*  Modal de éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl text-center"
          >
             Pago realizado exitosamente
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

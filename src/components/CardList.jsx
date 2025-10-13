"use client";
import { useEffect, useState } from "react";
import AddCardModal from "./AddCardModal";
import "../../src/app/globals.css";
import { motion, AnimatePresence } from "framer-motion";

export default function CardList({ requesterId, fixerId, jobId, amount }) {
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [processingCardId, setProcessingCardId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState(null); // card a pagar

  const fetchCards = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/cards?userId=${requesterId}`);
      if (!res.ok) throw new Error("Error fetching cards");
      const data = await res.json();
      setCards(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCardAdded = async ({ payment }) => {
    await fetchCards();
    setShowModal(false);
    showSuccessModal(`Pago realizado exitosamente: ${payment.amount} BOB`);
  };

  const confirmPay = (card) => {
    setConfirmModal(card);
  };

  const handlePayWithCard = async (card) => {
    if (processingCardId) return;
    setProcessingCardId(card._id);
    setConfirmModal(null);

    try {
      const paymentRes = await fetch("http://localhost:4000/api/createpayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId,
          fixerId,
          jobId,
          cardId: card._id,
          amount,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        alert(`Error en el pago: ${paymentData?.error || "Desconocido"}`);
        return;
      }

      showSuccessModal(`Pago realizado exitosamente: ${paymentData.payment.amount} BOB`);
      await fetchCards();
    } catch (err) {
      console.error(err);
      alert("Error al procesar el pago. Revisa la consola.");
    } finally {
      setProcessingCardId(null);
    }
  };

  const showSuccessModal = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  // 🎨 Paleta más realista y oscura
  const cardBackgrounds = {
    visa: "from-blue-950 via-blue-800 to-blue-700",
    mastercard: "from-red-900 via-orange-800 to-yellow-700",
    amex: "from-cyan-900 via-teal-800 to-teal-700",
    default: "from-gray-800 via-gray-700 to-gray-600",
  };

  const getCardBackground = (brand) => {
    const key = brand?.toLowerCase();
    return cardBackgrounds[key] || cardBackgrounds.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-10 text-white relative">
      <div className="flex justify-between items-center gap-3 mb-10">
        <h1 className="text-3xl font-extrabold"> Mis Tarjetas Guardadas</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-700 rounded-xl shadow-lg hover:bg-blue-800 transition-all font-semibold flex items-center gap-2"
        >
           Agregar➕
        </motion.button>
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-gray-400">No tienes tarjetas guardadas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {cards.map((card, index) => (
            <motion.div
              key={card._id}
              initial={{ rotateY: 10, rotateX: 8, y: 10, opacity: 0 }}
              animate={{ rotateY: 0, rotateX: 0, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 10, delay: index * 0.1 }}
              whileHover={{
                rotateY: 8,
                y: -5,
                boxShadow: "0px 8px 25px rgba(0,0,0,0.3)",
              }}
              className={`relative rounded-2xl shadow-2xl p-6 text-white bg-gradient-to-br ${getCardBackground(
                card.brand
              )} cursor-pointer border border-white/10`}
            >
              {/* Reflejo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl pointer-events-none"></div>

              {/* Logo */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-lg font-semibold tracking-wide uppercase">{card.brand}</p>
                <img
                  src={
                    card.brand?.toLowerCase() === "visa"
                      ? "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                      : card.brand?.toLowerCase() === "mastercard"
                      ? "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      : "https://upload.wikimedia.org/wikipedia/commons/f/fd/Generic-credit-card-icon.svg"
                  }
                  alt="brand"
                  className="h-6 w-auto"
                />
              </div>

              {/* Número */}
              <div className="text-2xl tracking-widest font-mono mb-4">
                **** **** **** {card.last4}
              </div>

              {/* Exp y titular */}
              <div className="flex justify-between text-sm opacity-90">
                <div>
                  <p className="uppercase">Expira</p>
                  <p className="font-semibold">
                    {card.expMonth}/{card.expYear}
                  </p>
                </div>
                <div className="text-right">
                  <p className="uppercase">Titular</p>
                  <p className="font-semibold truncate w-32">Usuario</p>
                </div>
              </div>

              {card.isDefault && (
                <div className="absolute top-2 right-2 bg-green-600 px-2 py-1 text-xs rounded-full shadow">
                  Predeterminada
                </div>
              )}

              {/* Botón pagar */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => confirmPay(card)}
                disabled={processingCardId === card._id}
                className={`mt-6 w-full py-2 rounded-xl font-bold text-white shadow-lg ${
                  processingCardId === card._id
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {processingCardId === card._id
                  ? "Procesando..."
                  : `Pagar ${amount} BOB`}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal agregar tarjeta */}
      {showModal && (
        <AddCardModal
          userId={requesterId}
          fixerId={fixerId}
          jobId={jobId}
          amount={amount}
          onClose={() => setShowModal(false)}
          onCardAdded={handleCardAdded}
        />
      )}

      {/* Modal de confirmación */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full"
            >
              <h2 className="text-xl font-bold mb-4">⚠️ Confirmar Pago</h2>
              <p className="text-gray-300 mb-6">
                ¿Seguro que deseas pagar <span className="font-bold text-green-400">{amount} BOB</span> 
                con la tarjeta terminada en <span className="font-bold">{confirmModal.last4}</span>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-5 py-2 bg-gray-600 rounded-xl hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handlePayWithCard(confirmModal)}
                  className="px-5 py-2 bg-green-600 rounded-xl hover:bg-green-700 transition font-semibold"
                >
                  Confirmar Pago
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal éxito */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50"
          >
            <div className="bg-gray-800 text-white px-10 py-6 rounded-2xl shadow-xl text-center">
              <h2 className="text-xl font-bold mb-3">✅ ¡Transacción Exitosa!</h2>
              <p className="text-gray-300">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

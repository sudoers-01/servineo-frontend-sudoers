"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentMethodUI from "./PaymentMethodUI";
import CardList from "./CardList";
import { createCashPayment } from "../service/payments";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
  "pk_test_51SHGq0Fp8K0s2pYx4l5z1fkIcXSouAknc9gUV6PpYKR8TjexmaC3OiJR9jNIa09e280Pa6jGVRA6ZNY7kSCCGcLt002CEmfDnU"
); 

interface PaymentProps {
  amount: number;
  jobId: string;
  requesterId: string;
  fixerId: string;
  onClose: () => void; // callback para cerrar modal
}

export default function PaymentMethods({
  amount,
  jobId,
  requesterId,
  fixerId,
  onClose,
}: PaymentProps) {
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [showCashPayment, setShowCashPayment] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);

  const router = useRouter();

  const goToQR = () => {
    router.push(
      `/payment/qr?trabajoId=${jobId}&bookingId=TRABAJO-${jobId}&providerId=DEMO-PROVIDER&amount=${amount}&currency=BOB`
    );
  };

  const handlePayCash = async () => {
    try {
      const payload = {
        jobId,
        requesterId,
        fixerId,
        subTotal: amount,
        service_fee: 0,
        discount: 0,
        currency: "BOB",
        paymentMethod: "Efectivo",
      };
      const resp = await createCashPayment(payload as any);
      const created: any = resp?.data || resp?.payment || resp;
      setCreatedPaymentId(created?.id || created?._id || null);
      setShowCashPayment(true);
    } catch (e: any) {
      console.error("Error creando pago en efectivo:", e);
      alert(e.message || "Error al crear pago en efectivo");
    }
  };

  return (
    <>
      {/* Overlay principal */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[10] bg-black/50 flex items-center justify-center p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()} // evita que clic dentro cierre modal
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-6 relative flex flex-col items-center justify-center gap-6"
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-3xl font-bold transition-colors"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-center">Seleccione su método de pago</h2>

          <div className="w-full flex flex-col gap-4">
            <button
              onClick={() => setShowCardPayment(true)}
              className="w-full bg-[#1AA7ED] hover:bg-[#2B6AE0] text-[#F9FAFB] px-6 py-3 rounded-lg flex items-center gap-4 text-xl font-medium justify-center transition-colors"
            >
              <span className="text-2xl">💳</span> Tarjeta de Crédito
            </button>

            <button
              onClick={goToQR}
              className="w-full bg-[#1AA7ED] hover:bg-[#2B6AE0] text-[#F9FAFB] px-6 py-3 rounded-lg flex items-center gap-4 text-xl font-medium justify-center transition-colors"
            >
              <span className="text-2xl">⊞</span> Pago QR
            </button>

            <button
              onClick={handlePayCash}
              className="w-full bg-[#1AA7ED] hover:bg-[#2B6AE0] text-[#F9FAFB] px-6 py-3 rounded-lg flex items-center gap-4 text-xl font-medium justify-center transition-colors"
            >
              <span className="text-2xl">💵</span> Pago Efectivo
            </button>
          </div>
        </div>
      </div>

      {/* Cash Payment Modal */}
      {showCashPayment && createdPaymentId && (
        <PaymentMethodUI
          paymentId={createdPaymentId}
          onClose={() => setShowCashPayment(false)}
        />
      )}

      {/* Card Payment Modal */}
      {showCardPayment && (
        <div className="fixed inset-0 z-[1100] bg-black/60 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCardPayment(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-3xl font-bold transition-colors"
            >
              ✕
            </button>

            <Elements stripe={stripePromise}>
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold text-center">
                  Selecciona tu tarjeta o agrega una nueva
                </h2>

                <div className="w-full">
                  <CardList
                    requesterId={requesterId}
                    fixerId={fixerId}
                    jobId={jobId}
                    amount={amount}
                    onPaymentSuccess={() => setShowCardPayment(false)}
                  />
                </div>
              </div>
            </Elements>
          </div>
        </div>
      )}
    </>
  );
}

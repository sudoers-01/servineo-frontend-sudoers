"use client"

import { Card } from "../Card"

export type PaymentMethod = "cash" | "qr" | "card"

interface PaymentStepProps {
  payments: PaymentMethod[]
  accountInfo: string
  onTogglePayment: (method: PaymentMethod) => void
  onAccountInfoChange: (info: string) => void
  paymentsError?: string
  accountError?: string
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  qr: "QR",
  card: "Tarjeta",
}

export function PaymentStep({
  payments,
  accountInfo,
  onTogglePayment,
  onAccountInfoChange,
  paymentsError,
  accountError,
}: PaymentStepProps) {
  const needsAccount = payments.includes("qr") || payments.includes("card")

  return (
    <Card title="Métodos de pago aceptados">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(["cash", "qr", "card"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onTogglePayment(m)}
              className={
                "rounded-full px-4 py-2 text-sm transition " +
                (payments.includes(m) ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-900 hover:bg-gray-100")
              }
            >
              {PAYMENT_LABELS[m]}
            </button>
          ))}
        </div>

        {needsAccount && (
          <div className="space-y-1">
            <label className="text-sm text-gray-800">Cuenta para recibir pagos (CBU/IBAN/alias)</label>
            <input
              value={accountInfo}
              onChange={(e) => onAccountInfoChange(e.target.value)}
              placeholder="Ingrese su cuenta"
              className="w-full rounded-full bg-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        )}

        {paymentsError && <p className="text-sm text-red-600">{paymentsError}</p>}
        {accountError && <p className="text-sm text-red-600">{accountError}</p>}
      </div>
    </Card>
  )
}

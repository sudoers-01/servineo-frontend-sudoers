"use client"

export default function PaymentMethodCashFixer({ trabajo, onClose, onBack }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h1 className="text-xl font-semibold">Metodo de pago Efectivo</h1>
          <button onClick={onClose} className="hover:bg-blue-700 px-3 py-1 rounded text-xl">✕</button>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Confirmacion del Pago Recibido
            </h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 max-w-xl mx-auto">
            {/* Codigo de Trabajo */}
            <div className="flex items-center gap-6">
              <label className="text-lg font-semibold text-gray-900 w-48 text-left">
                Codigo de Trabajo
              </label>
              <input
                type="text"
                value={`COD-${trabajo?.id || '0000'}`}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-lg"
              />
            </div>

            {/* Monto a Pagar */}
            <div className="flex items-center gap-6">
              <label className="text-lg font-semibold text-gray-900 w-48 text-left">
                Monto a Pagar
              </label>
              <input
                type="text"
                value={`${trabajo?.monto || 0} Bs.`}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-lg"
              />
            </div>

            {/* Estado */}
            <div className="flex items-center gap-6">
              <label className="text-lg font-semibold text-gray-900 w-48 text-left">
                Estado
              </label>
              <div className="flex-1 px-4 py-3 bg-gray-400 rounded-md text-center">
                <span className="text-lg font-semibold text-gray-700">
                  PENDIENTE
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-6 mt-12">
            <button className="px-12 py-3 bg-black text-white text-lg font-semibold rounded-md hover:bg-gray-400 transition-colors">
              Confirmar Pago Recibido
            </button>
            <button 
              onClick={onBack}
              className="px-12 py-3 bg-gray-300 text-gray-700 text-lg font-semibold rounded-md hover:bg-gray-400 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
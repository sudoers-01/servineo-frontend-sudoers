'use client';
import React from 'react';

type DataPoint = { label: string; value: number };

type Props = {
  onClose: () => void;
  total: number;
  data: DataPoint[];
};

export default function RecentEarningsModal({ onClose, total, data }: Props) {
  const limitedData = data.slice(0, 7);
  const maxVal = Math.max(...limitedData.map((d) => d.value), 1);
  const yStep = 50;
  const maxTick = Math.max(yStep, Math.ceil(maxVal / yStep) * yStep, 250);
  const yTicks = Array.from({ length: Math.floor(maxTick / yStep) + 1 }, (_, i) => i * yStep);
  const isEmpty = !limitedData.length || limitedData.every((d) => d.value === 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl p-6 relative font-['Roboto']">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700">Tus Ingresos Recientes</h2>
          <div className="bg-[#2c6ef7] text-white px-4 py-2 rounded-md text-lg font-semibold">
            Ganancias: {total}
          </div>
        </div>

        {isEmpty ? (
          <div className="bg-[#f3f5fb] border border-[#d6dcf2] rounded-xl p-10 text-center shadow-inner">
            <p className="text-xl sm:text-2xl font-semibold text-[#2c6ef7] mb-10">
              Aun no tienes transacciones completadas
            </p>
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#2c6ef7] hover:bg-[#1f5ad6] text-white font-semibold rounded-lg shadow-sm transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        ) : (
          <div className="relative bg-white border border-gray-200 rounded-lg p-4">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-sm text-gray-700">
              Ganancias (Bs)
            </div>
            <div className="ml-10">
              <div className="relative h-64">
                {/* Líneas y etiquetas del eje Y */}
                {yTicks.map((tick) => {
                  const top = 100 - (tick / maxTick) * 100;
                  return (
                    <div
                      key={tick}
                      className="absolute left-0 right-0 flex items-center"
                      style={{ top: `${top}%`, transform: 'translateY(50%)' }}
                    >
                      <span className="text-xs text-gray-500 w-10 -ml-10 text-right">{tick}</span>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>
                  );
                })}

                <div className="absolute inset-0 flex items-end justify-between gap-3">
                  {limitedData.map((item) => {
                    const boost = 1.18; // realce visual
                    const heightPct = Math.min(100, (item.value / maxVal) * 100 * boost);
                    return (
                      <div key={item.label} className="flex flex-col items-center justify-end flex-1">
                        <div
                          className="w-14 sm:w-16 bg-[#2c6ef7] rounded-t-md"
                          style={{ height: `${heightPct}%`, minHeight: '2rem' }}
                        />
                        <span className="mt-2 text-sm font-semibold text-gray-700">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#2c6ef7] hover:bg-[#1f5ad6] text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

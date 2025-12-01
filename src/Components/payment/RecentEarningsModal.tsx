//src/Components/payment/RecentEarningsModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Filter, Loader2, AlertCircle } from 'lucide-react';
import EarningsFilterModal from './EarningsFilterModal';

type Props = {
  onClose: () => void;
  fixerId?: string; // Ahora es opcional
};

export default function RecentEarningsModal({ onClose, fixerId: propFixerId }: Props) {
  const [fixerId, setFixerId] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<{ label: string; value: number }[]>([]);
  const [currentTotal, setCurrentTotal] = useState(0);

  // Obtener fixerId solo en el cliente
  useEffect(() => {
    console.log("🔍 Intentando obtener fixerId...");
    
    // Primero intentar usar el fixerId de las props
    if (propFixerId) {
      console.log("✅ fixerId obtenido de props:", propFixerId);
      setFixerId(propFixerId);
      return;
    }
    
    // Si no viene por props, buscar en diferentes lugares
    if (typeof window !== 'undefined') {
      try {
        // Intentar Redux store primero
        const reduxState = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.store?.getState?.();
        if (reduxState?.fixer?.id || reduxState?.fixer?._id) {
          const id = reduxState.fixer.id || reduxState.fixer._id;
          console.log("✅ fixerId obtenido de Redux:", id);
          setFixerId(id);
          return;
        }

        if (reduxState?.user?.id || reduxState?.user?._id) {
          const id = reduxState.user.id || reduxState.user._id;
          console.log("✅ fixerId obtenido de Redux user:", id);
          setFixerId(id);
          return;
        }
        
        // Intentar localStorage como fallback
        const possibleKeys = ['user', 'fixer', 'auth', 'userData'];
        for (const key of possibleKeys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              const id = data.id || data._id || data.fixerId || data.userId;
              if (id) {
                console.log(`✅ fixerId obtenido de localStorage.${key}:`, id);
                setFixerId(id);
                return;
              }
            } catch (e) {
              // Continuar con la siguiente key
            }
          }
        }
        
        console.error("❌ No se encontró fixerId en ningún lugar");
        console.log("Redux state disponible:", reduxState);
        console.log("localStorage keys:", Object.keys(localStorage));
        setError("No se pudo obtener tu ID de usuario");
        setLoading(false);
      } catch (error) {
        console.error("❌ Error al obtener fixerId:", error);
        setError("Error al obtener información de usuario");
        setLoading(false);
      }
    }
  }, [propFixerId]);
  
  // Fechas por defecto: últimos 7 días
  const getDefaultDates = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);
    
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates());

  // Formatear fecha para etiquetas
  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    return `${day} ${month}`;
  };

  // Función para cargar datos desde el backend
  const fetchEarnings = async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    try {
      const url = `${BACKEND_URL}/api/lab/earnings/${fixerId}?fromDate=${from}&toDate=${to}`;
      console.log("📊 Cargando ganancias desde:", url);
      console.log("📅 Rango de fechas:", { from, to });
      
      const res = await fetch(url);
      
      console.log("📡 Respuesta recibida - Status:", res.status);
      
      if (!res.ok) {
        let errorMessage = "Error al cargar ganancias";
        try {
          const errData = await res.json();
          errorMessage = errData.error || errData.message || errorMessage;
          console.error("❌ Error del servidor:", errData);
        } catch (parseError) {
          console.error("❌ Error al parsear respuesta de error:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("📦 Datos completos recibidos:", result);
      
      if (result.success && result.data) {
        // Transformar datos al formato esperado
        const transformedData = result.data.earningsByDay.map((item: any) => ({
          label: formatDateLabel(item.date),
          value: item.total
        }));
        
        console.log("✅ Datos transformados:", {
          total: result.data.totalEarnings,
          dias: transformedData.length,
          data: transformedData
        });
        
        setCurrentData(transformedData);
        setCurrentTotal(result.data.totalEarnings);
      } else {
        console.error("❌ Estructura de datos incorrecta:", result);
        throw new Error("Estructura de datos incorrecta del servidor");
      }
    } catch (err: any) {
      console.error("❌ Error completo:", err);
      setError(err.message || "Error inesperado al cargar datos");
    } finally {
      setLoading(false);
      console.log("🏁 fetchEarnings finalizado");
    }
  };

  // Cargar datos cuando fixerId esté disponible
  useEffect(() => {
    if (fixerId) {
      console.log("🔄 Cargando datos para fixerId:", fixerId);
      fetchEarnings(dateRange.from, dateRange.to);
    }
  }, [fixerId]); // Solo se ejecuta cuando fixerId cambia

  // Si no hay fixerId, mostrar error inmediatamente
  if (!fixerId) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl p-8">
          <div className="text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sesión no encontrada</h3>
            <p className="text-gray-600 mb-4">
              No pudimos obtener tu información de usuario. Por favor, inicia sesión nuevamente.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#2c6ef7] hover:bg-[#1f5ad6] text-white font-semibold rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Función para aplicar filtros
  const handleApplyFilter = async (from: string, to: string) => {
    setDateRange({ from, to });
    await fetchEarnings(from, to);
    setShowFilterModal(false);
  };

  // Calcular valores dinámicos para el gráfico
  const limitedData = currentData.slice(0, 7); // Máximo 7 días
  const maxVal = Math.max(...limitedData.map((d) => d.value), 1);
  
  // Calcular el paso del eje Y dinámicamente
  const calculateYStep = (max: number): number => {
    if (max <= 100) return 25;
    if (max <= 250) return 50;
    if (max <= 500) return 100;
    if (max <= 1000) return 200;
    return 500;
  };
  
  const yStep = calculateYStep(maxVal);
  const maxTick = Math.max(yStep, Math.ceil(maxVal / yStep) * yStep, 100);
  const yTicks = Array.from({ length: Math.floor(maxTick / yStep) + 1 }, (_, i) => i * yStep);
  
  const isEmpty = !limitedData.length || limitedData.every((d) => d.value === 0);

  // Estado de carga
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#2c6ef7] mb-4" size={48} />
            <p className="text-lg text-gray-600">Cargando tus ganancias...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl p-8">
          <div className="text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar ganancias</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => fetchEarnings(dateRange.from, dateRange.to)}
                className="px-6 py-2 bg-[#2c6ef7] hover:bg-[#1f5ad6] text-white font-semibold rounded-lg transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl p-6 relative font-['Roboto']">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700">Tus Ingresos Recientes</h2>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#2c6ef7] text-white px-4 py-2 rounded-md text-lg font-semibold">
                Ganancias: {currentTotal}
              </div>
              
              {/* Botón Filtros */}
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-[#2c6ef7] hover:bg-[#1f5ad6] text-white font-semibold rounded-md shadow-sm transition-colors"
              >
                <Filter size={18} />
                Filtros
              </button>
            </div>
          </div>

          {isEmpty ? (
            <div className="bg-[#f3f5fb] border border-[#d6dcf2] rounded-xl p-10 text-center shadow-inner">
              <p className="text-xl sm:text-2xl font-semibold text-[#2c6ef7] mb-10">
                Aun no tienes transacciones completadas en este período
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="px-8 py-3 bg-[#2c6ef7] hover:bg-[#1f5ad6] text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Cambiar Fechas
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Cerrar
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
                    {limitedData.map((item, index) => {
                      const heightPct = Math.min(100, (item.value / maxTick) * 100);
                      return (
                        <div key={`${item.label}-${index}`} className="flex flex-col items-center justify-end flex-1 group relative">
                          {/* Tooltip al hacer hover */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10">
                            <p className="font-bold">Bs. {item.value.toFixed(2)}</p>
                            <p className="text-xs opacity-75">{item.label}</p>
                          </div>
                          
                          {/* Barra */}
                          <div
                            className="w-14 sm:w-16 bg-[#2c6ef7] rounded-t-md transition-all hover:bg-[#1f5ad6]"
                            style={{ 
                              height: `${heightPct}%`, 
                              minHeight: heightPct > 0 ? '2rem' : '0' 
                            }}
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

      {/* Modal de Filtro */}
      {showFilterModal && (
        <EarningsFilterModal
          currentFrom={dateRange.from}
          currentTo={dateRange.to}
          onApply={handleApplyFilter}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </>
  );
}
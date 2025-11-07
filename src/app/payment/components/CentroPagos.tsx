// Tener 'lucide-react' instalado: npm install lucide-react
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Wallet, Building2, FileText, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const CentroDePagos = () => {
  const router = useRouter();
  const [fixerData, setFixerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // FIXER_ID - Este vendría de la autenticación/sesión del usuario
  const FIXER_ID = "68e87a9cdae3b73d8040102f"; // Cambiar por el ID real del fixer autenticado

  useEffect(() => {
    fetchFixerData();
  }, []);

  const fetchFixerData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      console.log(`🔍 Intentando conectar a: ${BACKEND_URL}/api/fixer/payment-center/${FIXER_ID}`);
      
      const response = await fetch(`${BACKEND_URL}/api/fixer/payment-center/${FIXER_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Datos recibidos:', result);
      
      // El backend devuelve: { success: true, data: {...} }
      if (result.success && result.data) {
        setFixerData(result.data);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('❌ Error fetching fixer data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Datos de prueba cuando no hay conexión o el FIXER_ID no existe
      console.log('⚠️ Usando datos de prueba');
      setFixerData({
        saldoActual: 13.00,
        totalGanado: 15420.00,
        trabajosCompletados: 23,
        fixerId: FIXER_ID,
        isTestData: true // Flag para indicar que son datos de prueba
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Componente de Carga ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  // --- Componente Principal ---
  return (
    // Fondo gris claro, como en el mockup
    <div className="min-h-screen bg-gray-100">
      {/* Header: Fondo azul sólido (Este se queda a lo ancho) */}
      <div className="bg-blue-600 text-white px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold">Centro de Pagos</h1>
      </div>

      {/* Contenedor principal para centrar y limitar el ancho con un padding general */}
      {/* CAMBIO: max-w-3xl para un ancho de escritorio más balanceado */}
      <div className="max-w-3xl mx-auto px-4"> 

        {/* Aviso de Datos de Prueba (si aplica) */}
        {fixerData?.isTestData && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <p className="text-sm text-yellow-800">
                Mostrando datos de prueba. No se encontró información del fixer.
              </p>
            </div>
          </div>
        )}

        {/* Tarjeta de Saldo: Fondo azul sólido */}
        <div className="pt-6 pb-4">
          {/* CAMBIO: Padding responsivo (p-4 en móvil, sm:p-6 en escritorio) */}
          <div className="bg-blue-600 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
            
            {/* CAMBIO: flex-col en móvil, sm:flex-row en escritorio */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <Wallet size={44} className="opacity-90 flex-shrink-0" />
              <div>
                <span className="text-sm opacity-90">Saldo Actual</span>
                {/* CAMBIO: text-3xl en móvil, sm:text-4xl en escritorio */}
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Bs. {fixerData?.saldoActual?.toFixed(2) || '0.00'}
                </h2>
              </div>
            </div>

            {/* CAMBIO: grid-cols-1 en móvil, sm:grid-cols-2 en escritorio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Total Ganado */}
              <div className="bg-[#759ae0] rounded-xl p-4">
                <p className="text-xs text-white opacity-75 mb-1">Total Ganado</p>
                <p className="text-xl font-bold text-white">
                  Bs. {typeof fixerData?.totalGanado === 'number' 
                    ? fixerData.totalGanado.toFixed(2) 
                    : typeof fixerData?.totalGanado === 'string'
                    ? parseFloat(fixerData.totalGanado).toFixed(2)
                    : '0.00'}
                </p>
              </div>

              {/* Trabajos Completados */}
              <div className="bg-[#759ae0] rounded-xl p-4">
                <p className="text-xs text-white opacity-75 mb-1">Trabajos Completados</p>
                <p className="text-3xl font-bold text-white">
                  {fixerData?.trabajosCompletados !== undefined 
                    ? fixerData.trabajosCompletados 
                    : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas: Título más sutil y cambio de color en 'Mis Facturas' */}
        <div className="pb-6">
          <h3 className="text-base font-semibold text-gray-600 mb-3">Acciones Rápidas</h3>
          
          {/* Este layout (space-y-3) es inherentemente responsivo, no necesita cambios */}
          <div className="space-y-3">
            
            {/* Fixer Wallet */}
            <button
              onClick={() => router.push(`/payment/FixerWallet?fixerId=${FIXER_ID}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
            >
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Wallet className="text-blue-600" size={28} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-800 text-base">Fixer Wallet</h4>
                <p className="text-sm text-gray-500">Ver saldo, recargar y revisar movimientos</p>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
            </button>

            {/* Mi cuenta bancaria */}
            <button 
              onClick={() => router.push('/cuenta-bancaria')} // Usar router.push
              className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
            >
              <div className="bg-cyan-100 p-3 rounded-xl group-hover:bg-cyan-200 transition-colors">
                <Building2 className="text-cyan-600" size={28} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-800 text-base">Mi cuenta bancaria</h4>
                <p className="text-sm text-gray-500">Administración de la cuenta bancaria</p>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-cyan-600 transition-colors" size={24} />
            </button>

            {/* Mis Facturas */}
            <button 
              onClick={() => router.push('/facturas')} // Usar router.push
              className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
            >
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                <FileText className="text-blue-600" size={28} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-800 text-base">Mis Facturas</h4>
                <p className="text-sm text-gray-500">Ver registro de facturas</p>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
            </button>
          </div>
        </div>

        {/* Botón de Reintento (si hay error) */}
        {error && !fixerData?.isTestData && (
          <div className="pb-6">
            <button
              onClick={fetchFixerData}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Reintentar carga
            </button>
          </div>
        )}

      </div> {/* Cierre del div contenedor */}
    </div>
  );
};

export default CentroDePagos;
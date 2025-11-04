
import React, { useState, useEffect } from 'react';
import { Wallet, Building2, FileText, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const CentroDePagos = () => {
  const [fixerData, setFixerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // FIXER_ID - Este vendría de la autenticación/sesión del usuario
  const FIXER_ID = "123456"; // Cambiar por el ID real del fixer autenticado

  useEffect(() => {
    fetchFixerData();
  }, []);

  const fetchFixerData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 🔧 IMPORTANTE: Ajusta el puerto según tu configuración
      // Si el backend está en puerto 4000, usa: http://localhost:4000
      // Si el backend está en puerto 3000, usa: http://localhost:3000
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
        console.log('📦 Estructura de data:', result.data);
        console.log('💰 Saldo Actual:', result.data.saldoActual);
        console.log('💵 Total Ganado:', result.data.totalGanado);
        console.log('📊 Trabajos Completados:', result.data.trabajosCompletados);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">Centro de Pagos</h1>
      </div>

      {/* Test Data Warning */}
      {fixerData?.isTestData && (
        <div className="mx-4 mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <p className="text-sm text-yellow-800">
              Mostrando datos de prueba. No se encontró información del fixer.
            </p>
          </div>
        </div>
      )}

      {/* Balance Card */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl">
          {/* Saldo Actual */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Wallet size={20} />
              <span className="text-sm text-white">Saldo Actual</span>
            </div>
            <h2 className="text-5xl font-bold text-white">
              Bs. {fixerData?.saldoActual?.toFixed(2) || '0.00'}
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Ganado */}
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
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
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
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

      {/* Acciones Rápidas */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
        
        <div className="space-y-3">
          {/* Fixer Wallet */}
          <button 
            onClick={() => window.location.href = '/fixer-wallet'}
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
            onClick={() => window.location.href = '/cuenta-bancaria'}
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
            onClick={() => window.location.href = '/facturas'}
            className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
          >
            <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
              <FileText className="text-purple-600" size={28} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-800 text-base">Mis Facturas</h4>
              <p className="text-sm text-gray-500">Ver registro de facturas</p>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-purple-600 transition-colors" size={24} />
          </button>
        </div>
      </div>

      {/* Retry Button if error */}
      {error && !fixerData?.isTestData && (
        <div className="px-4 pb-6">
          <button
            onClick={fetchFixerData}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Reintentar carga
          </button>
        </div>
      )}
    </div>
  );
};

export default CentroDePagos;

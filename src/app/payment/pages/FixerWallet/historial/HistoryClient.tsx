// src/app/payment/pages/FixerWallet/historial/HistoryPageClient.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calendar, Loader2, AlertCircle } from 'lucide-react';

// --- Interfaces (SIN CAMBIOS) ---
interface Transaction {
  _id: string;
  type: string; // 'deposit' o 'commission'
  amount: number;
  description: string;
  method?: string;
  createdAt: string; 
  jobId?: string;
  status?: string; // Status es opcional aquí
}

interface FilterSettings {
  fromDate: string;
  toDate: string;
  type: string[]; 
}

export default function FixerWalletHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [receivedFixerId, setReceivedFixerId] = useState<string | null>(null);

  // --- Estados de Filtros (SIN CAMBIOS) ---
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    fromDate: '',
    toDate: '',
    type: [], 
  });
  
  // --- Estados de Datos (SIN CAMBIOS) ---
  const [walletData, setWalletData] = useState<{ balance: number } | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga de Datos Reales (SIN CAMBIOS) ---
  useEffect(() => {
    const fixerId = searchParams.get('fixerId');
    if (fixerId) {
      setReceivedFixerId(fixerId);
      fetchHistoryData(fixerId); 
    } else {
      setError("No se proporcionó un ID de Fixer.");
      setLoading(false);
    }
  }, [searchParams]);

  const fetchHistoryData = async (fixerId: string) => {
    setLoading(true);
    setError(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/fixer/payment-center/${fixerId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al cargar los datos");
      }

      const result = await res.json();
      if (result.success && result.data) {
        setWalletData({ balance: result.data.saldoActual });
        setAllTransactions(result.data.transactions || []);
        setFilteredTransactions(result.data.transactions || []);
      } else {
        throw new Error(result.error || "No se pudieron cargar los datos.");
      }
    } catch (err: any) {
      setError(err.message || "Un error inesperado ocurrió.");
    } finally {
      setLoading(false);
    }
  };
  
  // --- Lógica de Filtro (SIN CAMBIOS) ---
  useEffect(() => {
    let tempTxs = [...allTransactions];

    if (filterSettings.type.length > 0) {
      tempTxs = tempTxs.filter(tx => filterSettings.type.includes(tx.type));
    }
    if (filterSettings.fromDate) {
      try {
        const from = new Date(filterSettings.fromDate + 'T00:00:00');
        tempTxs = tempTxs.filter(tx => new Date(tx.createdAt) >= from);
      } catch (e) { console.error("Fecha 'desde' inválida:", filterSettings.fromDate); }
    }
    if (filterSettings.toDate) {
      try {
        const to = new Date(filterSettings.toDate + 'T23:59:59');
        tempTxs = tempTxs.filter(tx => new Date(tx.createdAt) <= to);
      } catch (e) { console.error("Fecha 'hasta' inválida:", filterSettings.toDate); }
    }

    setFilteredTransactions(tempTxs);
  }, [filterSettings, allTransactions]);
  
  // --- Funciones de helper (SIN CAMBIOS) ---
  const handleApplyFilter = (newFilters: FilterSettings) => {
    setFilterSettings(newFilters);
    const active = newFilters.fromDate !== '' || newFilters.toDate !== '' || newFilters.type.length > 0;
    setIsFiltered(active);
    setShowFilterModal(false);
  };
  const clearFilter = () => {
    setFilterSettings({ fromDate: '', toDate: '', type: [] });
    setIsFiltered(false);
  };
  const formatCurrency = (value: number) => {
    return `Bs. ${Math.abs(value).toFixed(2)}`;
  };

  // --- (Estados de Carga y Error SIN CAMBIOS) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
         <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }
  if (error) {
     return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {/* ... (Error UI) ... */}
      </div>
    );
  }

  // --- PANTALLA PRINCIPAL (SIN CAMBIOS) ---
  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Historial de Movimientos</h1>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* Balance Card */}
          <div className="p-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Saldo Actual</p>
                <p className="text-blue-600 text-3xl font-bold">
                  Bs. {walletData?.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Wallet size={32} className="text-blue-600 opacity-70" />
            </div>
          </div>

          {/* Todos los movimientos */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-700 font-semibold text-lg">Todos los Movimientos</h2>
              
              {isFiltered ? (
                <button
                  onClick={clearFilter}
                  className="text-red-500 font-semibold text-sm"
                >
                  Eliminar Filtro
                </button>
              ) : (
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="text-blue-600 font-semibold text-sm"
                >
                  Añadir Filtro
                </button>
              )}
            </div>
            
            {/* --- LISTA FILTRADA --- */}
            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <div key={tx._id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.amount > 0 ? (
                        <TrendingUp className="text-green-600" size={20} />
                      ) : (
                        <TrendingDown className="text-red-600" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {tx.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                    <p className={`font-bold text-lg whitespace-nowrap ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-4 shadow-sm text-center text-gray-500 py-10">
                  <p>No se encontraron movimientos que coincidan con su filtro.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE FILTRO (Aquí están las correcciones) --- */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilter}
          currentFilters={filterSettings}
        />
      )}
    </>
  );
}


// ===================================================================
// --- Componente del Modal de Filtro (CORREGIDO) ---
// ===================================================================
interface FilterModalProps {
  onClose: () => void;
  onApply: (settings: FilterSettings) => void;
  currentFilters: FilterSettings;
}

function FilterModal({ onClose, onApply, currentFilters }: FilterModalProps) {
  const [fromDate, setFromDate] = useState(currentFilters.fromDate);
  const [toDate, setToDate] = useState(currentFilters.toDate);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(currentFilters.type);
  const [dateError, setDateError] = useState<string | null>(null);

  // --- ================================== ---
  // --- FUNCIÓN 'isValidDate' CORREGIDA ---
  // --- ================================== ---
  /**
   * Comprueba si un string YYYY-MM-DD es una fecha calendario válida.
   * Evita fechas como '2025-11-31'.
   */
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return true; // Un campo vacío es válido

    // 1. Comprueba el formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    // 2. Parsea los números del string
    const parts = dateString.split('-');
    const inYear = parseInt(parts[0], 10);
    const inMonth = parseInt(parts[1], 10); // (1-12)
    const inDay = parseInt(parts[2], 10);

    // 3. Crea la fecha usando los números.
    //    Date(año, mesIndex (0-11), dia)
    //    Si ponemos 'new Date(2025, 10, 31)' (31 de Nov), 
    //    se convertirá automáticamente en '1 de Dic'.
    const d = new Date(inYear, inMonth - 1, inDay);

    // 4. Comparamos si la fecha creada sigue coincidiendo con lo que entró.
    //    Si la fecha "rebalsó" (ej. 31 de Nov se volvió 1 de Dic),
    //    d.getMonth()+1 (12) no será igual a inMonth (11).
    return (
      d.getFullYear() === inYear &&
      d.getMonth() + 1 === inMonth &&
      d.getDate() === inDay
    );
  };
  // --- ================================== ---
  // --- FIN DE LA CORRECCIÓN ---
  // --- ================================== ---

  const handleSubmit = () => {
    // 1. Validación de fecha real (CORREGIDA)
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      setDateError("Por favor, introduce una fecha real (ej. '30/11' pero no '31/11').");
      return;
    }

    // 2. Validación de rango
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setDateError("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.");
      return; 
    }
    
    setDateError(null);
    onApply({ fromDate, toDate, type: selectedTypes });
  };
  
  const handleDateChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setDateError(null); 
  };

  const handleTypeChange = (value: string) => {
    setSelectedTypes(prev => 
      prev.includes(value)
        ? prev.filter(type => type !== value) 
        : [...prev, value] 
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Añadir Filtro</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
            Seleccione los campos para que se añada un filtro
          </h2>
          
          <div className="space-y-5">
            {/* Fila "Desde" */}
            <div className="flex items-center gap-4">
              <label htmlFor="fromDate" className="w-16 font-semibold text-gray-700">Desde</label>
              <div className="relative flex-1">
                <input 
                  id="fromDate"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={fromDate}
                  onChange={(e) => handleDateChange(setFromDate, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Fila "Hasta" */}
            <div className="flex items-center gap-4">
              <label htmlFor="toDate" className="w-16 font-semibold text-gray-700">Hasta</label>
              <div className="relative flex-1">
                <input 
                  id="toDate"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={toDate}
                  onChange={(e) => handleDateChange(setToDate, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Checkboxes para "Incluir" */}
            <div className="flex items-start gap-4">
              <label className="w-16 font-semibold text-gray-700 pt-2">Incluir</label>
              <div className="flex-1 flex flex-col gap-2 pt-2">
                <label htmlFor="filter-recargas" className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="filter-recargas" 
                    value="deposit"
                    checked={selectedTypes.includes('deposit')}
                    onChange={() => handleTypeChange('deposit')}
                    className="w-5 h-5 accent-blue-600 rounded"
                  />
                  <span className="font-medium text-gray-700">Recargas</span>
                </label>
                <label htmlFor="filter-comisiones" className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="filter-comisiones" 
                    value="commission"
                    checked={selectedTypes.includes('commission')}
                    onChange={() => handleTypeChange('commission')}
                    className="w-5 h-5 accent-blue-600 rounded"
                  />
                  <span className="font-medium text-gray-700">Comisiones</span>
                </label>
              </div>
            </div>

            {dateError && (
              <p className="text-red-500 text-sm text-center font-medium">
                {dateError}
              </p>
            )}
            
            <div className="flex items-center justify-between gap-4 pt-4"> 
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Añadir Filtro
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
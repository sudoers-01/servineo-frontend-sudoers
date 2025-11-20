// src/app/redux/features/searchHistory/useSearchHistory.ts
import { useState, useEffect, useCallback } from 'react';
import {
  useGetSearchHistoryQuery,
  useDeleteSearchHistoryMutation,
  useClearSearchHistoryMutation,
} from '@/app/redux/services/searchHistoryApi';

const HISTORY_KEY = 'job_search_history_v1';
const MAX_HISTORY_ITEMS = 10;

interface UseSearchHistoryOptions {
  useBackend?: boolean;
  maxItems?: number;
  storageKey?: string;
}

interface UseSearchHistoryReturn {
  history: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (item: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useSearchHistory(
  options: UseSearchHistoryOptions = {}
): UseSearchHistoryReturn {
  const {
    useBackend = false,
    maxItems = MAX_HISTORY_ITEMS,
    storageKey = HISTORY_KEY,
  } = options;

  const [history, setHistory] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  // ===== RTK QUERY HOOKS =====
  const { 
    data: backendHistory, 
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useGetSearchHistoryQuery('', {
    skip: !useBackend,
  });

  const [deleteHistoryItem, { isLoading: isDeleting }] = useDeleteSearchHistoryMutation();
  const [clearHistoryMutation, { isLoading: isClearing }] = useClearSearchHistoryMutation();

  const isLoading = isLoadingHistory || isDeleting || isClearing;
  const error = localError || (historyError ? 'Error al cargar historial' : null);

  // ===== FUNCIONES DE LOCALSTORAGE =====
  const loadFromLocalStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading search history from localStorage:', error);
      return [];
    }
  }, [storageKey]);

  const persistToLocalStorage = useCallback((items: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving search history to localStorage:', error);
    }
  }, [storageKey]);

  // ===== CARGAR HISTORIAL INICIAL =====
  useEffect(() => {
    if (useBackend && backendHistory) {
      // Si usamos backend, sincronizar con localStorage
      setHistory(backendHistory);
      persistToLocalStorage(backendHistory);
    } else if (!useBackend) {
      // Solo localStorage
      const localHistory = loadFromLocalStorage();
      setHistory(localHistory);
    }
  }, [useBackend, backendHistory, loadFromLocalStorage, persistToLocalStorage]);

  // ===== AGREGAR AL HISTORIAL =====
  const addToHistory = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      // Actualizar estado optimísticamente
      setHistory((prev) => {
        const filtered = prev.filter((item) => item !== trimmed);
        const updated = [trimmed, ...filtered].slice(0, maxItems);
        persistToLocalStorage(updated);
        return updated;
      });

      // El backend ya guarda automáticamente cuando se hace onSearch()
      // Si usamos backend, refrescar después de un tiempo
      if (useBackend) {
        setTimeout(() => {
          refetchHistory();
        }, 500);
      }
    },
    [maxItems, persistToLocalStorage, useBackend, refetchHistory]
  );

  // ===== ELIMINAR ITEM =====
  const removeFromHistory = useCallback(
    async (item: string) => {
      setLocalError(null);

      try {
        if (useBackend) {
          // Usar RTK Query mutation
          const result = await deleteHistoryItem(item).unwrap();
          
          if (!result.success) {
            throw new Error('Backend deletion failed');
          }

          // Actualizar con la respuesta del backend
          setHistory(result.updatedHistory);
          persistToLocalStorage(result.updatedHistory);
          
          console.log('History updated after delete:', result.updatedHistory);
        } else {
          // Solo localStorage
          setHistory((prev) => {
            const updated = prev.filter((h) => h !== item);
            persistToLocalStorage(updated);
            return updated;
          });
        }
      } catch (err) {
        console.error('Remove from history error:', err);
        setLocalError('Error al eliminar del historial');
        
        // Recargar desde backend en caso de error
        if (useBackend) {
          try {
            await refetchHistory();
          } catch (reloadErr) {
            console.error('Error reloading history after failed delete:', reloadErr);
          }
        }
      }
    },
    [useBackend, deleteHistoryItem, persistToLocalStorage, refetchHistory]
  );

  // ===== LIMPIAR TODO =====
  const clearHistory = useCallback(async () => {
    setLocalError(null);

    try {
      if (useBackend) {
        // Usar RTK Query mutation
        const result = await clearHistoryMutation().unwrap();
        
        if (!result.success) {
          throw new Error('Backend clear failed');
        }
        
        setHistory(result.updatedHistory);
        persistToLocalStorage(result.updatedHistory);
        
        console.log('History cleared, updated:', result.updatedHistory);
      } else {
        // Solo localStorage
        setHistory([]);
        persistToLocalStorage([]);
      }
    } catch (err) {
      console.error('Clear history error:', err);
      setLocalError('Error al limpiar historial');
      
      // Recargar desde backend en caso de error
      if (useBackend) {
        try {
          await refetchHistory();
        } catch (reloadErr) {
          console.error('Error reloading history after failed clear:', reloadErr);
        }
      }
    }
  }, [useBackend, clearHistoryMutation, persistToLocalStorage, refetchHistory]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    isLoading,
    error,
  };
}
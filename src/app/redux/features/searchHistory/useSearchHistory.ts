// src/app/redux/features/searchHistory/useSearchHistory.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/app/lib/api';
import { ensureSessionId } from '@/app/lib/session';

const HISTORY_KEY = 'job_search_history_v1';
const MAX_HISTORY_ITEMS = 10;

interface SearchHistoryItem {
  searchTerm: string;
}

interface HistoryPayload {
  searchHistory?: SearchHistoryItem[];
}

interface UseSearchHistoryOptions {
  useBackend?: boolean;
  maxItems?: number;
  storageKey?: string;
}

interface UseSearchHistoryReturn {
  history: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (item: string) => void;
  clearHistory: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook centralizado para gestionar el historial de búsqueda
 * Soporta localStorage y backend opcional
 */
export function useSearchHistory(
  options: UseSearchHistoryOptions = {}
): UseSearchHistoryReturn {
  const {
    useBackend = false,
    maxItems = MAX_HISTORY_ITEMS,
    storageKey = HISTORY_KEY,
  } = options;

  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== FUNCIONES DE BACKEND =====
  const fetchHistoryFromBackend = useCallback(async (searchTerm: string = '') => {
    try {
      ensureSessionId();
      const endpoint = `/api/devmaster/offers?action=getHistory&search=${encodeURIComponent(searchTerm)}`;
      const resp = await api.get<HistoryPayload>(endpoint);
      
      if (resp.success && resp.data?.searchHistory) {
        return resp.data.searchHistory.map((item) => item.searchTerm);
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo historial del backend:', error);
      throw error;
    }
  }, []);

  const deleteFromBackend = useCallback(async (searchTerm: string) => {
    try {
      ensureSessionId();
      const endpoint = `/api/devmaster/offers?action=deleteHistory&searchTerm=${encodeURIComponent(searchTerm)}`;
      const resp = await api.get<unknown>(endpoint);
      return resp.success;
    } catch (error) {
      console.error('Error eliminando del backend:', error);
      throw error;
    }
  }, []);

  const clearAllHistoryBackend = useCallback(async () => {
    try {
      ensureSessionId();
      const endpoint = `/api/devmaster/offers?action=clearAllHistory`;
      const resp = await api.get<unknown>(endpoint);
      return resp.success;
    } catch (error) {
      console.error('Error limpiando historial del backend:', error);
      throw error;
    }
  }, []);

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
    const loadInitialHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (useBackend) {
          // Cargar desde backend
          const backendHistory = await fetchHistoryFromBackend('');
          if (backendHistory.length > 0) {
            setHistory(backendHistory);
            persistToLocalStorage(backendHistory);
          } else {
            // Fallback a localStorage si backend está vacío
            const localHistory = loadFromLocalStorage();
            setHistory(localHistory);
          }
        } else {
          // Solo localStorage
          const localHistory = loadFromLocalStorage();
          setHistory(localHistory);
        }
      } catch (err) {
        setError('Error al cargar historial');
        // Fallback a localStorage en caso de error
        const localHistory = loadFromLocalStorage();
        setHistory(localHistory);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialHistory();
  }, [useBackend, fetchHistoryFromBackend, loadFromLocalStorage, persistToLocalStorage]);

  // ===== AGREGAR AL HISTORIAL =====
  const addToHistory = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setHistory((prev) => {
        const filtered = prev.filter((item) => item !== trimmed);
        const updated = [trimmed, ...filtered].slice(0, maxItems);
        persistToLocalStorage(updated);
        return updated;
      });
    },
    [maxItems, persistToLocalStorage]
  );

  // ===== ELIMINAR ITEM =====
  const removeFromHistory = useCallback(
    async (item: string) => {
      setError(null);

      try {
        if (useBackend) {
          const success = await deleteFromBackend(item);
          if (!success) {
            throw new Error('Backend deletion failed');
          }
        }

        setHistory((prev) => {
          const updated = prev.filter((h) => h !== item);
          persistToLocalStorage(updated);
          return updated;
        });
      } catch (err) {
        setError('Error al eliminar del historial');
        console.error('Remove from history error:', err);
      }
    },
    [useBackend, deleteFromBackend, persistToLocalStorage]
  );

  // ===== LIMPIAR TODO =====
  const clearHistory = useCallback(async () => {
    setError(null);

    try {
      if (useBackend) {
        const success = await clearAllHistoryBackend();
        if (!success) {
          throw new Error('Backend clear failed');
        }
      }

      setHistory([]);
      persistToLocalStorage([]);
    } catch (err) {
      setError('Error al limpiar historial');
      console.error('Clear history error:', err);
    }
  }, [useBackend, clearAllHistoryBackend, persistToLocalStorage]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    isLoading,
    error,
  };
}
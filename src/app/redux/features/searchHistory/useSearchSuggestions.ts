// src/app/redux/features/searchHistory/useSearchSuggestions.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/app/lib/api';

interface SuggestionItem {
  term?: string;
  count?: number;
  score?: number;
  source?: string;
}

interface SuggestionsPayload {
  suggestions?: SuggestionItem[];
}

interface UseSearchSuggestionsOptions {
  enabled?: boolean;
  minLength?: number;
  debounceMs?: number;
  maxResults?: number;
  endpoint?: string;
  useCache?: boolean;
}

interface UseSearchSuggestionsReturn {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  clearCache: () => void;
}

/**
 * Hook para obtener sugerencias de búsqueda desde el backend
 * Con debounce automático, caché y cancelación de peticiones
 */
export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {}
): UseSearchSuggestionsReturn {
  const {
    enabled = true,
    minLength = 1,
    debounceMs = 300,
    maxResults = 6,
    endpoint = '/api/devmaster/offers',
    useCache = true,
  } = options;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  // ===== LIMPIAR CACHÉ =====
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // ===== FETCH SUGERENCIAS =====
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      // Cancelar petición anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Verificar caché
      if (useCache) {
        const cached = cacheRef.current.get(searchQuery);
        if (cached) {
          setSuggestions(cached);
          setError(null);
          return;
        }
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const url = `${endpoint}?search=${encodeURIComponent(searchQuery)}&limit=${maxResults}&record=false`;
        const resp = await api.get<SuggestionsPayload>(url);

        if (resp.success && resp.data?.suggestions) {
          const results = resp.data.suggestions
            .map((s) => String(s.term ?? ''))
            .filter(Boolean)
            .slice(0, maxResults);

          // Guardar en caché
          if (useCache) {
            cacheRef.current.set(searchQuery, results);
          }

          setSuggestions(results);
        } else {
          setSuggestions([]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching suggestions:', err);
          setError('Error al cargar sugerencias');
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, maxResults, useCache]
  );

  // ===== EFFECT CON DEBOUNCE =====
  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const trimmed = query.trim();

    if (trimmed.length < minLength) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, enabled, minLength, debounceMs, fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    clearCache,
  };
}
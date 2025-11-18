import { ParamsMap } from './types';
export const SESSION_KEYS = {
  FROM_ADV: 'fromAdv',
  APPLIED_FILTERS: 'appliedFilters',
  ADV_SEARCH_STATE: 'advSearch_state',
} as const;

/**
 * Helper para leer sessionStorage de forma segura
 */
export const getSessionValue = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.sessionStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading sessionStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Helper para guardar en sessionStorage
 */
export const saveToSession = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to sessionStorage key "${key}":`, error);
    }
  }
};

/**
 * Helper para eliminar de sessionStorage
 */
export const removeFromSession = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage key "${key}":`, error);
    }
  }
};

/**
 * Marcar que viene de búsqueda avanzada
 */
export const markFromAdvSearch = (): void => {
  saveToSession(SESSION_KEYS.FROM_ADV, 'true');
};

/**
 * Verificar si viene de búsqueda avanzada
 */
export const isFromAdvSearch = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const fromStorage = window.sessionStorage.getItem(SESSION_KEYS.FROM_ADV);
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get('fromAdv');
    return fromStorage === 'true' || fromUrl === 'true';
  } catch {
    return false;
  }
};

/**
 * Limpiar marca de búsqueda avanzada
 */
export const clearAdvSearchMark = (): void => {
  removeFromSession(SESSION_KEYS.FROM_ADV);
};

/**
 * Guardar filtros aplicados
 */
export const saveAppliedFilters = (params: ParamsMap): void => {
  saveToSession(SESSION_KEYS.APPLIED_FILTERS, params);
};

/**
 * Obtener filtros aplicados
 */
export const getAppliedFilters = (): ParamsMap | null => {
  return getSessionValue<ParamsMap | null>(SESSION_KEYS.APPLIED_FILTERS, null);
};

/**
 * Limpiar filtros aplicados
 */
export const clearAppliedFilters = (): void => {
  removeFromSession(SESSION_KEYS.APPLIED_FILTERS);
};

/**
 * Guardar estado completo de AdvSearch
 */
export const saveAdvSearchState = (state: any): void => {
  saveToSession(SESSION_KEYS.ADV_SEARCH_STATE, state);
};

/**
 * Obtener estado de AdvSearch
 */
export const getAdvSearchState = (): any | null => {
  return getSessionValue<any | null>(SESSION_KEYS.ADV_SEARCH_STATE, null);
};

/**
 * Limpiar estado de AdvSearch
 */
export const clearAdvSearchState = (): void => {
  removeFromSession(SESSION_KEYS.ADV_SEARCH_STATE);
};
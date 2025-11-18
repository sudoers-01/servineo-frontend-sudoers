import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { useGetOffersQuery } from '@/app/redux/services/jobOffersApi';
import {
  setSearch,
  setFilters,
  setSortBy,
  setDate,
  setRating,
  setPaginaActual,
  setRegistrosPorPagina,
  setTitleOnly,
  setExact,
  updatePagination,
  restoreSavedState,
  resetFilters,
  enablePersistence,
} from '@/app/redux/slice/jobOfert';
import {
  selectSearchParams,
  selectJobOffersState,
} from './selectors';
import { parseUrlToFilters, filtersToUrlParams, parseAppliedParams } from './parsers';
import { restoreFromStorage } from './storage';
import { 
  isFromAdvSearch, 
  clearAdvSearchMark, 
  saveAppliedFilters, 
  getAppliedFilters,
  clearAppliedFilters 
} from './session';
import { ParamsMap } from './types';

/**
 * Hook principal que combina RTK Query con el slice de Redux
 * Reemplaza el useEffect que disparaba fetchOffers
 */
export function useJobOffers() {
  const dispatch = useAppDispatch();
  const params = useAppSelector(selectSearchParams);
  
  // ✅ Usar RTK Query en lugar de thunk
  const { data, error, isLoading, isFetching } = useGetOffersQuery({
    search: params.search,
    filters: params.filters,
    sortBy: params.sortBy,
    date: params.date || undefined,
    rating: params.rating || undefined,
    page: params.page,
    limit: params.limit,
    titleOnly: params.titleOnly,
    exact: params.exact,
  });

  useEffect(() => {
    if (data) {
      const totalPages = Math.ceil(data.total / params.limit) || 1;
      dispatch(updatePagination({
        total: data.total,
        page: params.page,
        limit: params.limit,
        totalPages,
        isInitialSearch: params.page === 1,
      }));
    }
  }, [data, dispatch, params.page, params.limit]);

  return {
    offers: data?.data || [],
    total: data?.total || 0,
    isLoading: isLoading || isFetching,
    error: error ? 'Error al cargar ofertas' : null,
  };
}

/**
 * Hook para inicializar desde URL en el primer render
 * Reemplaza useInitialUrlParams y useApplyQueryToStore
 */
export function useInitialUrlParams() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Si hay parámetros en URL, usarlos
    if ([...searchParams.keys()].length > 0) {
      const parsed = parseUrlToFilters(searchParams);
      
      dispatch(setSearch(parsed.search));
      dispatch(setFilters(parsed.filters));
      dispatch(setSortBy(parsed.sortBy));
      dispatch(setDate(parsed.date));
      dispatch(setRating(parsed.rating));
      dispatch(setPaginaActual(parsed.page));
      dispatch(setRegistrosPorPagina(parsed.limit));
      dispatch(setTitleOnly(parsed.titleOnly));
      dispatch(setExact(parsed.exact));
    } else {
      // Si no hay URL params, intentar restaurar desde localStorage
      const restored = restoreFromStorage();
      dispatch(restoreSavedState(restored));
    }
  }, [searchParams, dispatch]);
}

/**
 * Hook para sincronizar Redux state con URL
 * Reemplaza useSyncUrlParams - Versión mejorada sin duplicación
 */
export function useSyncUrlParams() {
  const router = useRouter();
  const params = useAppSelector(selectSearchParams);
  const prevParamsRef = useRef<string>('');

  useEffect(() => {
    const currentParams = JSON.stringify(params);
    
    // Evitar actualizaciones innecesarias
    if (currentParams === prevParamsRef.current) return;
    prevParamsRef.current = currentParams;

    const urlParams = filtersToUrlParams({
      search: params.search,
      filters: params.filters,
      sortBy: params.sortBy,
      date: params.date,
      rating: params.rating,
      page: params.page,
      limit: params.limit,
      titleOnly: params.titleOnly,
      exact: params.exact,
    });

    const queryString = urlParams.toString();
    const target = queryString ? `?${queryString}` : '';

    // Evitar replace si ya es el mismo
    if (typeof window !== 'undefined' && window.location.search === target) return;

    router.replace(target, { scroll: false });
  }, [params, router]);
}

/**
 * Hook para manejar el reset de filtros
 */
export function useResetFilters() {
  const dispatch = useAppDispatch();

  const handleReset = () => {
    dispatch(resetFilters());
    setTimeout(() => {
      dispatch(enablePersistence());
    }, 0);
  };

  return handleReset;
}

/**
 * Hook para obtener el estado completo de jobOffers
 */
export function useJobOffersState() {
  return useAppSelector(selectJobOffersState);
}

/**
 * Hook para manejar Applied Filters en ResultsAdvSearch
 * Consolida la lógica de job-offer-hooks/useAppliedFilters.ts
 */
export function useAppliedFilters() {
  const [showAppliedFilters, setShowAppliedFilters] = useState<boolean>(false);
  const [appliedParams, setAppliedParams] = useState<ParamsMap | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Verificar si viene de búsqueda avanzada
      if (isFromAdvSearch()) {
        const sp = new URLSearchParams(window.location.search);
        const params = parseAppliedParams(sp);
        
        setAppliedParams(params);
        setShowAppliedFilters(true);
        
        // Persistir en sessionStorage para mantener en refresh
        saveAppliedFilters(params);
        
        // Limpiar la marca de origen
        clearAdvSearchMark();
      } else {
        // Si no viene de AdvSearch, intentar restaurar desde sessionStorage
        const saved = getAppliedFilters();
        if (saved) {
          setAppliedParams(saved);
          setShowAppliedFilters(true);
        }
      }
    } catch (error) {
      console.error('Error loading applied filters:', error);
    }
  }, []);

  const handleClearApplied = () => {
    setShowAppliedFilters(false);
    setAppliedParams(null);
    
    // Resetear filtros en Redux
    dispatch(resetFilters());
    
    // Limpiar sessionStorage
    clearAppliedFilters();
    
    if (typeof window !== 'undefined') {
      // Navegar a job-offer sin parámetros
      window.location.href = '/job-offer-list';
    }
  };

  return { 
    showAppliedFilters, 
    appliedParams, 
    handleClearApplied 
  };
}
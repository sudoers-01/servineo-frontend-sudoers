'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLogClickMutation } from '../../redux/services/activityApi';
import { useLogSearchMutation, useUpdateFiltersMutation } from '../../redux/services/searchApi';
import {
  SearchBar,
  NoResultsMessage,
  FilterButton,
  FilterDrawer,
  Paginacion,
  PaginationInfo,
  PaginationSelector,
  SortCard,
} from '@/Components/Job-offers';

import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  setSearch,
  setFilters,
  setSortBy,
  setRegistrosPorPagina,
  resetPagination,
  setRating,
  setPaginaActual,
  resetFilters,
  enablePersistence,
} from '@/app/redux/slice/jobOfert';
import type { FilterState } from '@/app/redux/features/jobOffers/types';
import { getSortValue } from '../../lib/constants/sortOptions';
import {
  useJobOffers,
  useInitialUrlParams,
  useSyncUrlParams,
} from '@/app/redux/features/jobOffers/jobOffersHooks';
import { JobOfferModal } from '@/Components/Job-offers/Job-offer-modal';
import { JobOffersView, type ViewMode } from '@/Components/Job-offers/JobOffersView';
import { ViewModeToggle } from '@/Components/Job-offers/ViewModeToggle';
import { useTranslations } from 'next-intl';
import type { JobOfferData, AdaptedJobOffer } from '@/types/jobOffers';

const SCROLL_POSITION_KEY = 'jobOffers_scrollPosition';

export default function JobOffersPage() {
  const t = useTranslations('jobOffers');
  const dispatch = useAppDispatch();

  useInitialUrlParams();

  const { offers, total, isLoading } = useJobOffers();

  const {
    sortBy,
    search,
    paginaActual,
    registrosPorPagina,
    error: reduxError,
    filters,
    rating,
  } = useAppSelector((state) => state.jobOfert);

  useSyncUrlParams();

  // ============================================================================
  // USER DATA FROM LOCALSTORAGE
  // ============================================================================
  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('visitor');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('servineo_user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          console.log('User object from localStorage:', userObj);
          // Obtener ID
          const id = userObj.id || userObj._id || userObj.userId || '';
          // Obtener rol, si no existe usar 'visitor'
          const role = userObj.role || 'visitor';
          setUserId(id);
          setUserRole(role);
          console.log('Extracted user ID:', id, 'Role:', role);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          setUserRole('visitor');
        }
      } else {
        console.warn('No servineo_user found in localStorage');
        setUserRole('visitor');
      }
    }
  }, []);

  // ============================================================================
  // SEARCH AND FILTER TRACKING
  // ============================================================================
  const [logSearch] = useLogSearchMutation();
  const [updateFilters] = useUpdateFiltersMutation();

  // Refs para rastrear valores anteriores y evitar envíos duplicados
  const previousSearchQueryRef = useRef<string>('');
  const previousFiltersRef = useRef<FilterState>(filters);
  const isInitialMountRef = useRef<boolean>(true);

  // Contador de filtros
  const filterCounterRef = useRef<number>(1);

  // Función para obtener el número real de resultados mostrados
  const getSearchCount = (): number => {
    // Si está cargando, retornar 0 o el valor actual
    if (isLoading) return 0;

    // Usar el total de ofertas que coinciden con los criterios actuales
    // Este `total` viene de `useJobOffers()` y ya está filtrado por búsqueda y filtros
    return total || 0;
  };

  // Función helper para obtener el valor del filtro fixer_name
  const getFixerNameValue = (): string => {
    const fixerNameFilter =
      (filters as any).fixerName || (filters as any).fixer_name || (filters as any).fixerNames;

    if (
      !fixerNameFilter ||
      (Array.isArray(fixerNameFilter) && fixerNameFilter.length === 0) ||
      fixerNameFilter === ''
    ) {
      return 'not_applied';
    }

    if (Array.isArray(fixerNameFilter)) {
      return fixerNameFilter.join(', ');
    }

    return fixerNameFilter.toString();
  };

  // Función helper para obtener el valor del filtro city
  const getCityValue = (): string => {
    if (!filters.city || (Array.isArray(filters.city) && filters.city.length === 0)) {
      return 'not_applied';
    }
    if (Array.isArray(filters.city)) {
      return filters.city.join(', ');
    }
    return filters.city;
  };

  // Función helper para obtener el valor del filtro job_type
  const getJobTypeValue = (): string => {
    if (!filters.category || filters.category.length === 0) {
      return 'not_applied';
    }
    return filters.category.join(', ');
  };

  // ============================================================================
  // HANDLE SEARCH SUBMIT - NUEVA BÚSQUEDA INDEPENDIENTE
  // ============================================================================
  const handleSearchSubmit = async (query: string) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dispatch(setSearch(query));
    dispatch(resetPagination());

    // Resetear contador de filtros para nueva búsqueda
    filterCounterRef.current = 1;

    // Pequeño delay para asegurar que los resultados se actualicen
    const timeoutId = setTimeout(async () => {
      // Solo enviar si el query es diferente al anterior o es una búsqueda nueva
      if (query.trim().length > 0) {
        const searchCount = getSearchCount();

        const searchData = {
          user_type: userRole,
          search_query: query,
          search_type: 'search_box',
          filters: {
            filter_1: {
              fixer_name: getFixerNameValue(),
              city: getCityValue(),
              job_type: getJobTypeValue(),
              search_count: searchCount,
            },
          },
        };

        try {
          console.log(
            'Enviando NUEVA BÚSQUEDA al backend (POST):',
            JSON.stringify(searchData, null, 2),
          );
          await logSearch(searchData).unwrap();
          console.log('Nueva búsqueda registrada exitosamente:', query, 'Resultados:', searchCount);
          previousSearchQueryRef.current = query;
        } catch (error) {
          console.error('Error al registrar nueva búsqueda:', error);
        }
      }
    }, 500); // Aumentado a 500ms para dar tiempo a que se actualicen los resultados

    return () => clearTimeout(timeoutId);
  };

  // ============================================================================
  // DETECTAR CAMBIOS EN FILTROS - SOLO PARA LA ÚLTIMA BÚSQUEDA
  // ============================================================================
  useEffect(() => {
    // Skip en el montaje inicial
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousFiltersRef.current = { ...filters };
      return;
    }

    // Solo procesar cambios de filtros si hay una búsqueda activa
    if (!previousSearchQueryRef.current) {
      previousFiltersRef.current = { ...filters };
      return;
    }

    // Comparar si los filtros han cambiado realmente
    const currentFilters = filters as any;
    const previousFilters = previousFiltersRef.current as any;

    const compareFilterValues = (prev: any, curr: any, key: string) => {
      const prevValue = prev[key];
      const currValue = curr[key];

      if (Array.isArray(prevValue) && Array.isArray(currValue)) {
        return JSON.stringify([...prevValue].sort()) !== JSON.stringify([...currValue].sort());
      }

      return prevValue !== currValue;
    };

    const filterKeys = ['city', 'category', 'range', 'fixerName', 'fixer_name', 'fixerNames'];

    const filtersChanged = filterKeys.some((key) =>
      compareFilterValues(previousFilters, currentFilters, key),
    );

    // Solo enviar si hay un cambio real en los filtros Y tenemos una búsqueda activa
    if (filtersChanged && previousSearchQueryRef.current) {
      // Actualizar ref primero para evitar envíos duplicados
      previousFiltersRef.current = { ...filters };

      // Usar un delay más largo para asegurar que los resultados se actualicen
      const timeoutId = setTimeout(async () => {
        // Incrementar contador para el nuevo filtro
        filterCounterRef.current++;

        const searchCount = getSearchCount();

        const filterData = {
          filters: {
            fixer_name: getFixerNameValue(),
            city: getCityValue(),
            job_type: getJobTypeValue(),
            search_count: searchCount,
          },
        };

        try {
          console.log(
            `Enviando FILTRO para búsqueda: "${previousSearchQueryRef.current}"`,
            JSON.stringify(filterData, null, 2),
          );

          await updateFilters(filterData).unwrap();
          console.log(`Filtro registrado exitosamente. Resultados: ${searchCount}`);
        } catch (error) {
          console.error('Error al registrar filtro:', error);
        }
      }, 500); // Aumentado a 500ms para dar tiempo a que se actualicen los resultados

      return () => clearTimeout(timeoutId);
    }
  }, [filters, updateFilters, isLoading, total]);

  // ============================================================================
  // RESET FILTERS HANDLER
  // ============================================================================
  const handleResetFilters = () => {
    const pageToRestore = hasActiveFilters.current ? pageBeforeFilter.current : 1;
    hasActiveFilters.current = false;

    dispatch(resetFilters());

    setTimeout(() => {
      dispatch(enablePersistence());
      dispatch(setPaginaActual(pageToRestore));
    }, 0);
  };

  // ============================================================================
  // EXISTING COMPONENT CODE
  // ============================================================================
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoredRef = useRef(false);
  const pageBeforeFilter = useRef<number>(1);
  const hasActiveFilters = useRef<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOffer, setSelectedOffer] = useState<AdaptedJobOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logClick] = useLogClickMutation();

  // Adapter function to convert JobOfferData from backend to AdaptedJobOffer
  const adaptJobOffer = (offer: JobOfferData): AdaptedJobOffer => {
    return {
      _id: offer._id,
      fixerId: offer.fixerId,
      name: offer.fixerName,
      title: offer.title,
      description: offer.description,
      tags: offer.tags || [],
      phone: offer.contactPhone,
      photos: offer.photos || [],
      services: offer.category ? [offer.category] : [],
      price: offer.price,
      createdAt: offer.createdAt instanceof Date ? offer.createdAt : new Date(offer.createdAt),
      city: offer.city,
    };
  };

  const handleCardClick = async (offer: JobOfferData) => {
    const adaptedOffer = adaptJobOffer(offer);
    setSelectedOffer(adaptedOffer);
    setIsModalOpen(true);

    if (!userId) {
      console.warn('User ID no disponible, no se registró el click');
      return;
    }

    const activityData = {
      userId: userId,
      date: new Date().toISOString(),
      role: userRole,
      type: 'click',
      metadata: {
        button: 'job_offer',
        jobTitle: adaptedOffer.title || 'Sin título',
        jobId: adaptedOffer._id,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      await logClick(activityData).unwrap();
      console.log('Click registrado:', adaptedOffer.title);
    } catch (error) {
      console.error('Error al registrar clic:', error);
    }
  };

  // Limpiar búsqueda si se navega directamente sin parámetros
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      if (params.toString() === '' && search !== '') {
        console.log('Navegación directa detectada, limpiando búsqueda guardada');
        dispatch(setSearch(''));
        previousSearchQueryRef.current = '';
      }
    }
  }, [dispatch, search]);

  // Guardar posición del scroll
  useEffect(() => {
    const saveScrollPosition = () => {
      try {
        sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
      } catch {
        // ignorar errores
      }
    };

    window.addEventListener('beforeunload', saveScrollPosition);
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  // Restaurar posición del scroll
  useEffect(() => {
    if (!isLoading && Array.isArray(offers) && offers.length > 0 && !scrollRestoredRef.current) {
      try {
        const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          if (!isNaN(position)) {
            setTimeout(() => {
              window.scrollTo(0, position);
              scrollRestoredRef.current = true;
              sessionStorage.removeItem(SCROLL_POSITION_KEY);
            }, 100);
          }
        }
      } catch {
        // ignorar errores
      }
    }
  }, [isLoading, offers]);

  // Sticky header
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      const hdr = document.querySelector('header');
      const h = hdr ? (hdr as HTMLElement).getBoundingClientRect().height : 0;
      if (stickyRef.current) {
        stickyRef.current.style.top = `${h}px`;
        stickyRef.current.style.zIndex = '40';
      }
    };

    update();
    window.addEventListener('resize', update);

    const hdrEl = document.querySelector('header');
    const mo = hdrEl ? new MutationObserver(update) : null;
    if (mo && hdrEl) mo.observe(hdrEl, { attributes: true, childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', update);
      if (mo) mo.disconnect();
    };
  }, []);

  // Handlers
  const handleRegistrosPorPaginaChange = (valor: number) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dispatch(setRegistrosPorPagina(valor));
  };

  const handleFiltersApply = (appliedFilters: FilterState) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const hasFilters =
      appliedFilters.range.length > 0 ||
      (Array.isArray(appliedFilters.city)
        ? appliedFilters.city.length > 0
        : !!appliedFilters.city) ||
      appliedFilters.category.length > 0;

    if (hasFilters && !hasActiveFilters.current) {
      pageBeforeFilter.current = paginaActual;
      hasActiveFilters.current = true;
    }

    if (!hasFilters) {
      hasActiveFilters.current = false;
    }

    dispatch(setFilters(appliedFilters));
    dispatch(resetPagination());
  };

  const handleSortChange = (option: string) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const backendSort = getSortValue(option);
    dispatch(setSortBy(backendSort));
  };

  const handlePageChange = (newPage: number) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dispatch(setPaginaActual(newPage));
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Resto del código JSX permanece igual...
  return (
    <>
      <h1 className="mt-20 sm:mt-24 md:mt-28 lg:mt-32 mb-0 text-center text-xl sm:text-2xl md:text-3xl font-bold pt-3 px-3">
        {t('pageTitle')}
      </h1>

      <div
        ref={stickyRef}
        className={`w-full mx-auto px-3 sm:px-4 md:px-6 lg:max-w-5xl sticky top-0 bg-white py-3 shadow-md ${
          isDrawerOpen ? 'z-10' : 'z-50'
        }`}
      >
        <div className="flex gap-2">
          <FilterButton onClick={toggleDrawer} />
          <SearchBar onSearch={handleSearchSubmit} />
        </div>

        {!isLoading && Array.isArray(offers) && offers.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center gap-2">
              <div className="w-auto">
                <SortCard value={sortBy} onSelect={handleSortChange} />
              </div>

              {/* Mobile view toggle */}
              <ViewModeToggle
                viewMode={viewMode}
                onChange={setViewMode}
                variant="mobile"
                className="flex lg:hidden"
              />

              {/* Desktop view toggle */}
              <ViewModeToggle
                viewMode={viewMode}
                onChange={setViewMode}
                variant="desktop"
                className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2"
              />

              <div className="hidden lg:block w-auto">
                <PaginationSelector
                  registrosPorPagina={registrosPorPagina}
                  onChange={handleRegistrosPorPaginaChange}
                />
              </div>
            </div>

            <div className="flex justify-center lg:hidden">
              <PaginationSelector
                registrosPorPagina={registrosPorPagina}
                onChange={handleRegistrosPorPaginaChange}
              />
            </div>
          </div>
        )}
      </div>

      <main className="px-4 sm:px-6 md:px-12 lg:px-24">
        {reduxError && (
          <div className="text-red-500 text-center mb-4 p-3 bg-red-100 rounded">{t('error')}</div>
        )}

        {isLoading && (
          <div className="text-blue-500 text-center mb-4 p-3 bg-blue-100 rounded">
            {t('loading', { default: 'Cargando ofertas...' })}
          </div>
        )}

        {/* Overlay cuando el drawer está abierto */}
        {isDrawerOpen && (
          <div className="fixed bg-black z-40" onClick={() => setIsDrawerOpen(false)} />
        )}

        <FilterDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onFiltersApply={handleFiltersApply}
          onRatingChange={(rating) => {
            scrollRestoredRef.current = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const hasRatingFilter = rating != null;
            if (hasRatingFilter && !hasActiveFilters.current) {
              pageBeforeFilter.current = paginaActual;
              hasActiveFilters.current = true;
            }

            if (!hasRatingFilter) {
              hasActiveFilters.current = false;
            }

            dispatch(setRating(rating));
            dispatch(resetPagination());
          }}
          onReset={handleResetFilters}
        />

        {!isLoading && Array.isArray(offers) && offers.length > 0 && (
          <div className="w-full max-w-5xl mx-auto mb-4">
            <div className="flex justify-center">
              <PaginationInfo
                paginaActual={paginaActual}
                registrosPorPagina={registrosPorPagina}
                totalRegistros={total}
              />
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl mx-auto">
          {!isLoading && Array.isArray(offers) && offers.length > 0 ? (
            <JobOffersView
              offers={offers}
              viewMode={viewMode}
              onOfferClick={handleCardClick}
              search={search}
            />
          ) : !isLoading ? (
            <NoResultsMessage search={search} />
          ) : null}
        </div>

        {!isLoading && Array.isArray(offers) && offers.length > 0 && viewMode !== 'map' && (
          <div className="mt-8 mb-24 flex justify-center">
            <Paginacion
              paginaActual={paginaActual}
              registrosPorPagina={registrosPorPagina}
              totalRegistros={total}
              onChange={handlePageChange}
            />
          </div>
        )}
      </main>

      <JobOfferModal
        offer={selectedOffer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

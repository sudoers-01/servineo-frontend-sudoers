// src/app/[locale]/job-offer-list/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { JobOffer, JobOfferBackend } from '../../lib/mock-data';
import { JobOfferCard } from '@/Components/Job-offers/Job-offer-card';
import { JobOfferModal } from '@/Components/Job-offers/Job-offer-modal';
import { MapView } from '@/Components/Job-offers/maps/MapView';
import { SearchHeader } from '@/Components/SearchHeader';
import { useLogClickMutation } from '../../redux/services/activityApi';
import { useLogSearchMutation, useUpdateFiltersMutation } from '../../redux/services/searchApi';
import { useGetAllJobOffersQuery } from '../../redux/services/jobOfferApi';
import { FiltersPanel } from '@/Components/FiltersPanel';
import { useAppSelector } from '../../redux/hooks';
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
import { adaptOfferToModalFormat } from '@/types/jobOffers';

const SCROLL_POSITION_KEY = 'jobOffers_scrollPosition';

export default function JobOffersPage() {
  const t = useTranslations('jobOffers');
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load offers from API
  const { data: apiOffersRaw = [], isLoading, isError } = useGetAllJobOffersQuery();
  
  // Cast to the correct backend type
  const apiOffers = apiOffersRaw as unknown as JobOfferBackend[];

  // Normalize API offers to UI shape
  const offers: JobOffer[] = useMemo(
    () =>
      apiOffers.map((o) => ({
        ...o,
        id: o._id || o.id || '',
        createdAt: o?.createdAt ? new Date(o.createdAt) : new Date(0),
        tags: o?.tags || [],
        photos: o?.photos || [],
        location: o?.location || { lat: 0, lng: 0, address: '' },
      })),
    [apiOffers]
  );

  const searchQuery = useAppSelector(selectSearchQuery);
  const selectedCities = useAppSelector(selectSelectedCities);
  const selectedJobTypes = useAppSelector(selectSelectedJobTypes);
  const selectedFixerNames = useAppSelector(selectSelectedFixerNames);
  const recentSearches = useAppSelector(selectRecentSearches);
  const persona = { id: '691646c477c99dee64b21689', nombre: 'Usuario POC' };
  const [logClick] = useLogClickMutation();
  
  const handleCardClick = async (offer: JobOffer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);

    const activityData = {
      userId: persona.id,
      date: new Date().toISOString(),
      role: 'requester' as const,
      type: 'click' as const,
      metadata: {
        button: 'job_offer',
        jobTitle: offer.title || 'Sin título',
        jobId: offer.id,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      await logClick(activityData).unwrap();
      console.log('Click registrado:', offer.title);
    } catch (error) {
      console.error('Error al registrar clic:', error);
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoredRef = useRef(false);
  const pageBeforeFilter = useRef<number>(1);
  const hasActiveFilters = useRef<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOffer, setSelectedOffer] = useState<AdaptedJobOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Limpiar búsqueda si se navega directamente sin parámetros
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      if (params.toString() === '' && search !== '') {
        console.log('Navegación directa detectada, limpiando búsqueda guardada');
        dispatch(setSearch(''));
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

  // Mantener actualizado el count de filteredOffers en un ref
  const filteredOffersCountRef = useRef<number>(0);
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

  // Refs para rastrear valores anteriores y evitar envíos duplicados
  const previousSearchQueryRef = useRef<string>('');
  const previousRecentSearchesRef = useRef<string[]>([]);
  const previousFixerNamesRef = useRef<string[]>([]);
  const previousCitiesRef = useRef<string[]>([]);
  const previousJobTypesRef = useRef<string[]>([]);
  const isInitialMountRef = useRef<boolean>(true);
  const lastSearchSentRef = useRef<string>('');

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
      appliedFilters.city !== '' ||
      appliedFilters.category.length > 0;

    if (hasFilters && !hasActiveFilters.current) {
      pageBeforeFilter.current = paginaActual;
      hasActiveFilters.current = true;
    }

    if (!hasFilters) {
      hasActiveFilters.current = false;
    }

          const searchData = {
            user_type: 'visitor' as const,
            search_query: currentQuery,
            search_type: 'search_box' as const,
            filters: {
              filter_1: {
                fixer_name: getFixerNameValue(),
                city: getCityValue(),
                job_type: getJobTypeValue(),
                search_count: searchCount,
              },
            },
          };

  const handleSortChange = (option: string) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const backendSort = getSortValue(option);
    dispatch(setSortBy(backendSort));
  };

  const handleSearchSubmit = (query: string) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dispatch(setSearch(query));
    dispatch(resetPagination());
  };

  const handleResetFilters = () => {
    const pageToRestore = hasActiveFilters.current ? pageBeforeFilter.current : 1;
    hasActiveFilters.current = false;

    dispatch(resetFilters());

    setTimeout(() => {
      dispatch(enablePersistence());
      dispatch(setPaginaActual(pageToRestore));
    }, 0);
  };

  const handlePageChange = (newPage: number) => {
    scrollRestoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dispatch(setPaginaActual(newPage));
  };

  // Handler para abrir modal al hacer click en el área de la oferta
  const handleCardClick = (offer: JobOfferData) => {
    const adaptedOffer = adaptOfferToModalFormat(offer);
    setSelectedOffer(adaptedOffer);
    setIsModalOpen(true);
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-800">{t('pageTitle')}</h1>
            </div>
          </div>
        </header>
        <main className="p-6">Cargando ofertas...</main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-800">{t('pageTitle')}</h1>
            </div>
          </div>
        </header>
        <main className="p-6">Error cargando ofertas.</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                <span className="font-medium">{t('backToHome')}</span>
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-800">{t('pageTitle')}</h1>
                <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                  {filteredOffers.length} {t('available')}
                </span>
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
          <div className="text-red-500 text-center mb-4 p-3 bg-red-100 rounded">{reduxError}</div>
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
            <JobOffersView offers={offers} viewMode={viewMode} onOfferClick={handleCardClick} />
          ) : !isLoading ? (
            <NoResultsMessage search={search} />
          ) : null}
        </div>

      <JobOfferModal
        offer={selectedOffer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  SearchBar,
  NoResultsMessage,
  FilterButton,
  FilterDrawer,
  Paginacion,
  PaginationInfo,
  PaginationSelector,
  CardJob,
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
import { MapView } from '@/Components/Job-offers/maps/MapView';
import { Map, List, LayoutGrid } from 'lucide-react';
import { mockJobOffers } from '@/app/lib/mock-data';
import { useTranslations } from 'next-intl';

const SCROLL_POSITION_KEY = 'jobOffers_scrollPosition';

// Type for the offer data from the backend
interface OfferData {
  _id: string;
  fixerId: string;
  fixerName: string;
  title: string;
  description: string;
  tags: string[];
  contactPhone: string;
  photos?: string[];
  imagenUrl?: string;
  category: string;
  price: number;
  createdAt: string | Date;
  city: string;
}

// Type for the adapted offer format (para el modal)
interface AdaptedOffer {
  _id: string;
  fixerId: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
  phone: string;
  photos: string[];
  services: string[];
  price: number;
  createdAt: Date;
  city: string;
}

export default function JobOffersPage() {
  const t = useTranslations('jobOffers');
  const dispatch = useAppDispatch();

  useInitialUrlParams();

  const { offers, total, isLoading, error } = useJobOffers();

  const {
    sortBy,
    search,
    paginaActual,
    registrosPorPagina,
  } = useAppSelector((state) => state.jobOfert);

  useSyncUrlParams();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoredRef = useRef(false);
  const pageBeforeFilter = useRef<number>(1);
  const hasActiveFilters = useRef<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list');
  const [selectedOffer, setSelectedOffer] = useState<AdaptedOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para adaptar datos de BD a formato para modal
  const adaptOfferToModalFormat = (offer: OfferData): AdaptedOffer | null => {
    if (!offer) return null;

    let photos: string[] = [];
    if (offer.photos && offer.photos.length > 0) {
      photos = offer.photos;
    } else if (offer.imagenUrl) {
      photos = [offer.imagenUrl];
    }

    return {
      _id: offer._id,
      fixerId: offer.fixerId,
      name: offer.fixerName,
      title: offer.title,
      description: offer.description,
      tags: offer.tags || [],
      phone: offer.contactPhone,
      photos: photos,
      services: offer.category ? [offer.category] : [],
      price: offer.price,
      createdAt: new Date(offer.createdAt || Date.now()),
      city: offer.city,
    };
  };

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
      appliedFilters.city !== '' ||
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
  const handleCardClick = (offer: OfferData) => {
    const adaptedOffer = adaptOfferToModalFormat(offer);
    setSelectedOffer(adaptedOffer);
    setIsModalOpen(true);
  };

  // Handler para click en oferta desde el mapa
  const handleOfferClick = (offer: OfferData) => {
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

              <div className="flex lg:hidden gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title={t('viewModes.grid', { default: 'Vista cuadrícula' })}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'map'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title={t('viewModes.map')}
                >
                  <Map className="w-5 h-5" />
                </button>
              </div>

              <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  title={t('viewModes.grid', { default: 'Vista cuadrícula' })}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm">{t('viewModes.grid', { default: 'Cuadrícula' })}</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  title={t('viewModes.list')}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm">{t('viewModes.list')}</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'map'
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  title={t('viewModes.map')}
                >
                  <Map className="w-4 h-4" />
                  <span className="text-sm">{t('viewModes.map')}</span>
                </button>
              </div>

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
        {error && (
          <div className="text-red-500 text-center mb-4 p-3 bg-red-100 rounded">{error}</div>
        )}

        {isLoading && (
          <div className="text-blue-500 text-center mb-4 p-3 bg-blue-100 rounded">
            {t('loading', { default: 'Cargando ofertas...' })}
          </div>
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
            <>
              {viewMode === 'map' ? (
                <div className="h-[calc(100vh-250px)] rounded-lg overflow-hidden border border-gray-200 bg-white mb-8">
                  <MapView
                    offers={mockJobOffers}
                    onOfferClick={(offer) => {
                      const originalOffer = offers.find((t: OfferData) => t._id === offer.id);
                      if (originalOffer) {
                        handleOfferClick(originalOffer);
                      }
                    }}
                  />
                </div>
              ) : (
                <CardJob
                  trabajos={offers}
                  viewMode={viewMode === 'grid' ? 'grid' : 'list'}
                  onClick={handleCardClick}
                />
              )}
            </>
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

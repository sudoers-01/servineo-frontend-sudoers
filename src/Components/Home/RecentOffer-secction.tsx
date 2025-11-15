// src/Components/Home/RecentOffer-section.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import RecentOfferCard from './RecentOfferCard';
import { JobOfferModal } from '../Job-offers/Job-offer-modal';
import { getImagesForJob } from '@/app/lib/constants/img';
import { api } from '@/app/lib/api';

// Tipos
interface OfferData {
  _id: string;
  fixerId: string;
  fixerName: string;
  fixerPhoto?: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  price: number;
  city: string;
  contactPhone: string;
  createdAt: string;
  rating?: number;
  photos?: string[];
  imagenUrl?: string;
  allImages?: string[];
}

interface OfferResponse {
  total: number;
  count: number;
  data: OfferData[];
  currentPage?: number;
}

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

const CATEGORIES = [
  'Todos',
  'Albañil',
  'Carpintero',
  'Cerrajero',
  'Decorador',
  'Electricista',
  'Fontanero',
  'Fumigador',
  'Instalador',
  'Jardinero',
  'Limpiador',
  'Mecánico',
  'Montador',
  'Pintor',
  'Pulidor',
  'Soldador',
  'Techador',
  'Vidriero',
  'Yesero',
];

export default function RecentOffersSection() {
  const t = useTranslations('RecentOffer');
  const tCat = useTranslations('Categories');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [trabajos, setTrabajos] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedOffer, setSelectedOffer] = useState<AdaptedOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [intervals, setIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);

      try {
        const urlParams = new URLSearchParams({
          sortBy: 'recent',
          page: '1',
          limit: '8',
        });

        if (selectedCategory !== 'Todos') {
          urlParams.append('category', selectedCategory);
        }

        const endpoint = `/api/devmaster/offers?${urlParams.toString()}`;
        const response = await api.get<OfferResponse>(endpoint);

        if (response.success && response.data) {
          setTrabajos(response.data.data || []);
          setError(null);
        } else {
          const errorMsg = response.error || 'Error al cargar ofertas';
          setError(errorMsg);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [selectedCategory]);

  // Cleanup intervals
  useEffect(() => {
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [intervals]);

  // Check scroll state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    return () => container.removeEventListener('scroll', checkScroll);
  }, [selectedCategory]);

  const adaptOfferToModalFormat = (offer: OfferData): AdaptedOffer => {
    // CORREGIDO: Usar allImages si está disponible, o generarlas
    let photos: string[] = [];

    if (offer.allImages && offer.allImages.length > 0) {
      // Si ya tenemos allImages del map, usarlas
      photos = offer.allImages;
    } else if (offer.photos && offer.photos.length > 0) {
      // Si tiene photos del API
      photos = offer.photos;
    } else if (offer.imagenUrl) {
      // Si tiene una sola imagen
      photos = [offer.imagenUrl];
    } else {
      // Generar imágenes basadas en categoría
      photos = getImagesForJob(offer._id, offer.category || 'Default');
    }

    return {
      _id: offer._id,
      fixerId: offer.fixerId || 'fixer-001',
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

  const trabajosConImagenes = trabajos.map((trabajo) => {
    const allImages = getImagesForJob(trabajo._id, trabajo.category);
    return {
      ...trabajo,
      allImages: allImages,
    };
  });

  const handleMouseEnter = (cardId: string, totalImages: number) => {
    setHoveredCard(cardId);
    if (totalImages > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => ({
          ...prev,
          [cardId]: ((prev[cardId] || 0) + 1) % totalImages,
        }));
      }, 2000);

      setIntervals((prev) => ({
        ...prev,
        [cardId]: interval,
      }));
    }
  };

  const handleMouseLeave = (cardId: string) => {
    setHoveredCard(null);

    if (intervals[cardId]) {
      clearInterval(intervals[cardId]);
      setIntervals((prev) => {
        const newIntervals = { ...prev };
        delete newIntervals[cardId];
        return newIntervals;
      });
    }

    setCurrentImageIndex((prev) => ({
      ...prev,
      [cardId]: 0,
    }));
  };

  const handlePrevImage = (cardId: string, totalImages: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const handleNextImage = (cardId: string, totalImages: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] || 0) + 1) % totalImages,
    }));
  };

  const handleCardClick = (offer: OfferData) => {
    const adaptedOffer = adaptOfferToModalFormat(offer);
    setSelectedOffer(adaptedOffer);
    setIsModalOpen(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('recOfTitle')}</h2>
            <p className="text-gray-600">{t('recOfDescription')}</p>
          </div>

          <Link
            href="/job-offer-list"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg"
          >
            {t('viewAll')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          {isMobile ? (
            // Mobile: Scrollable horizontal
            <div className="relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    canScrollLeft
                      ? 'bg-white border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {tCat(cat)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    canScrollRight
                      ? 'bg-white border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            // Desktop: Wrap layout
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {tCat(cat)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
          </div>
        )}

        {/* Offers Grid */}
        {!loading && !error && trabajosConImagenes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trabajosConImagenes.map((trabajo) => (
              <RecentOfferCard
                key={trabajo._id}
                offer={trabajo}
                onCardClick={handleCardClick}
                hoveredCard={hoveredCard}
                currentImageIndex={currentImageIndex[trabajo._id] || 0}
                onMouseEnter={() => handleMouseEnter(trabajo._id, trabajo.allImages?.length || 1)}
                onMouseLeave={() => handleMouseLeave(trabajo._id)}
                onPrevImage={handlePrevImage(trabajo._id, trabajo.allImages?.length || 1)}
                onNextImage={handleNextImage(trabajo._id, trabajo.allImages?.length || 1)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trabajosConImagenes.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <SlidersHorizontal className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOffersAvailable')}</h3>
            <p className="text-gray-500">{t('noOffersCategory')}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <JobOfferModal
        offer={selectedOffer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

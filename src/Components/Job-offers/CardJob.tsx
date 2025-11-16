'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MapPin, Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface OfferData {
  _id: string;
  fixerId: string;
  fixerName: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  city: string;
  contactPhone: string;
  createdAt: string;
  rating?: number;
  fixerPhoto?: string;
  imagenUrl?: string;
  photos?: string[];
}

interface CardJobProps {
  trabajos: OfferData[];
  viewMode?: 'grid' | 'list';
  onClick?: (offer: OfferData) => void;
}

const CardJob = ({ trabajos, viewMode = 'list', onClick }: CardJobProps) => {
  const router = useRouter();
  const t = useTranslations('cardJob');
  const tCat = useTranslations('Categories');

  const handleWhatsAppClick = (e: React.MouseEvent, contactPhone: string) => {
    e.stopPropagation();
    const cleanPhone = contactPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleFixerClick = (e: React.MouseEvent, fixerId?: string) => {
    e.stopPropagation();
    if (fixerId) {
      router.push(`/fixer/${fixerId}`);
    } else {
      router.push(`/fixer/fixer-001`);
    }
  };

  const trabajosConImagenes = useMemo(() => {
    const mappedTrabajos = trabajos.map((trabajo) => {
      let allImages: string[];

      if (trabajo.photos && trabajo.photos.length > 0) {
        allImages = trabajo.photos;
      } else if (trabajo.imagenUrl) {
        allImages = [trabajo.imagenUrl];
      } else {
        // Si no hay imágenes, usar array vacío o imagen por defecto
        allImages = [];
      }

      return {
        ...trabajo,
        imagenAsignada: allImages[0],
        allImages: allImages,
      };
    });

    return mappedTrabajos;
  }, [trabajos]);
  const GridView = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
    const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const handleMouseEnter = (cardId: string) => {
      setHoveredCard(cardId);
      intervalRefs.current[cardId] = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const trabajoConImagenes = trabajosConImagenes.find((trabajo) => trabajo._id === cardId);
          const totalImages = trabajoConImagenes?.allImages?.length || 1;
          return {
            ...prev,
            [cardId]: ((prev[cardId] || 0) + 1) % totalImages,
          };
        });
      }, 2000);
    };

    const handleMouseLeave = (cardId: string) => {
      setHoveredCard(null);
      if (intervalRefs.current[cardId]) {
        clearInterval(intervalRefs.current[cardId]);
        delete intervalRefs.current[cardId];
      }
      setCurrentImageIndex((prev) => ({
        ...prev,
        [cardId]: 0,
      }));
    };

    const handlePrevImage = (e: React.MouseEvent, cardId: string, totalImages: number) => {
      e.stopPropagation();
      if (intervalRefs.current[cardId]) {
        clearInterval(intervalRefs.current[cardId]);
      }
      setCurrentImageIndex((prev) => ({
        ...prev,
        [cardId]: ((prev[cardId] || 0) - 1 + totalImages) % totalImages,
      }));
    };

    const handleNextImage = (e: React.MouseEvent, cardId: string, totalImages: number) => {
      e.stopPropagation();
      if (intervalRefs.current[cardId]) {
        clearInterval(intervalRefs.current[cardId]);
      }
      setCurrentImageIndex((prev) => ({
        ...prev,
        [cardId]: ((prev[cardId] || 0) + 1) % totalImages,
      }));
    };

    useEffect(() => {
      const intervals = intervalRefs.current;
      return () => {
        Object.values(intervals).forEach(clearInterval);
      };
    }, []);

    const handleCardClick = (offer: OfferData) => {
      if (onClick) {
        onClick(offer);
      }
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {trabajosConImagenes.map((trabajo, index) => {
          const currentIndex = currentImageIndex[trabajo._id] || 0;
          const totalImages = trabajo.allImages?.length || 1;

          return (
            <div
              key={`${trabajo._id}-${index}`}
              onMouseEnter={() => handleMouseEnter(trabajo._id)}
              onMouseLeave={() => handleMouseLeave(trabajo._id)}
              className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1"
            >
              {/* Área clickeable para modal */}
              <div onClick={() => handleCardClick(trabajo)} className="cursor-pointer">
                {/* Imagen */}
                <div className="h-48 w-full relative overflow-hidden">
                  {trabajo.allImages?.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={trabajo.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={`object-cover transition-all duration-500 ${
                        idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                      }`}
                      style={{ position: 'absolute' }}
                      priority={idx === 0}
                    />
                  ))}

                  {/* Flechitas de navegación */}
                  {totalImages > 1 && hoveredCard === trabajo._id && (
                    <>
                      <button
                        onClick={(e) => handlePrevImage(e, trabajo._id, totalImages)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20 hover:scale-110"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-800" />
                      </button>
                      <button
                        onClick={(e) => handleNextImage(e, trabajo._id, totalImages)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20 hover:scale-110"
                        aria-label="Siguiente imagen"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Indicadores de imágenes */}
                  {totalImages > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {Array.from({ length: totalImages }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            idx === currentIndex ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* City Badge */}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm border border-primary">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-gray-700">{trabajo.city}</span>
                  </div>

                  {/* Price */}
                  <div className="absolute right-3 top-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold shadow-sm border border-primary/20">
                    <span className="text-primary">{trabajo.price?.toLocaleString()} Bs</span>
                  </div>
                </div>

                {/* Información de la oferta */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                    {trabajo.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {trabajo.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tCat(trabajo.category)}
                      </span>
                      {trabajo.tags && trabajo.tags.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {trabajo.tags[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(trabajo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Fixer */}
              <div className="border-t border-gray-100">
                <div className="p-3 flex items-center justify-between gap-3">
                  {/* Perfil clickeable */}
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handleFixerClick(e, trabajo.fixerId)}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                      {trabajo.fixerPhoto ? (
                        <Image
                          src={trabajo.fixerPhoto}
                          alt={trabajo.fixerName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {trabajo.fixerName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {trabajo.fixerName || t('defaultUserName')}
                      </p>
                      {trabajo.rating && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-gray-600">
                            {trabajo.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón WhatsApp */}
                  <button
                    onClick={(e) => handleWhatsAppClick(e, trabajo.contactPhone)}
                    className="flex-shrink-0 bg-[#1AA7ED] hover:bg-[#1AA7ED]/90 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-110 flex items-center gap-2 px-3 py-2"
                    aria-label={t('contactWhatsApp')}
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-medium">{trabajo.contactPhone}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const ListView = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
    const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const handleMouseEnter = (cardId: string) => {
      setHoveredCard(cardId);
      intervalRefs.current[cardId] = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const trabajoConImagenes = trabajosConImagenes.find((trabajo) => trabajo._id === cardId);
          const totalImages = trabajoConImagenes?.allImages?.length || 1;
          return {
            ...prev,
            [cardId]: ((prev[cardId] || 0) + 1) % totalImages,
          };
        });
      }, 2000);
    };

    const handleMouseLeave = (cardId: string) => {
      setHoveredCard(null);
      if (intervalRefs.current[cardId]) {
        clearInterval(intervalRefs.current[cardId]);
        delete intervalRefs.current[cardId];
      }
      setCurrentImageIndex((prev) => ({
        ...prev,
        [cardId]: 0,
      }));
    };

    const handlePrevImage = (e: React.MouseEvent, cardId: string, totalImages: number) => {
      e.stopPropagation();
      if (intervalRefs.current[cardId]) {
        clearInterval(intervalRefs.current[cardId]);
      }
      setCurrentImageIndex((prev) => ({
        ...prev,
        [cardId]: ((prev[cardId] || 0) - 1 + totalImages) % totalImages,
      }));
    };

    const handleNextImage = (e: React.MouseEvent, cardId: string, totalImages: number) => {
      e.stopPropagation();
      if (intervalRefs.current[cardId]) {
        clearInterval(intervalRefs.current[cardId]);
      }
      setCurrentImageIndex((prev) => ({
        ...prev,
        [cardId]: ((prev[cardId] || 0) + 1) % totalImages,
      }));
    };

    useEffect(() => {
      const intervals = intervalRefs.current;
      return () => {
        Object.values(intervals).forEach(clearInterval);
      };
    }, []);

    const handleCardClick = (offer: OfferData) => {
      if (onClick) {
        onClick(offer);
      }
    };

    return (
      <div className="flex flex-col gap-4">
        {trabajosConImagenes.map((trabajo) => {
          const currentIndex = currentImageIndex[trabajo._id] || 0;
          const totalImages = trabajo.allImages?.length || 1;

          return (
            <div
              key={trabajo._id}
              onMouseEnter={() => handleMouseEnter(trabajo._id)}
              onMouseLeave={() => handleMouseLeave(trabajo._id)}
              className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 flex flex-row"
            >
              {/* Imagen - clickeable para modal */}
              <div
                className="relative w-64 h-48 flex-shrink-0 overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(trabajo)}
              >
                {trabajo.allImages?.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={trabajo.title}
                    fill
                    sizes="16rem"
                    className={`object-cover transition-all duration-500 ${
                      idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                    }`}
                    style={{ position: 'absolute' }}
                    priority={idx === 0}
                  />
                ))}

                {/* Flechitas de navegación */}
                {totalImages > 1 && hoveredCard === trabajo._id && (
                  <>
                    <button
                      onClick={(e) => handlePrevImage(e, trabajo._id, totalImages)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20 hover:scale-110"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-800" />
                    </button>
                    <button
                      onClick={(e) => handleNextImage(e, trabajo._id, totalImages)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20 hover:scale-110"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Indicadores de imágenes */}
                {totalImages > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {Array.from({ length: totalImages }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          idx === currentIndex ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* City Badge */}
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm border border-primary">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-gray-700">{trabajo.city}</span>
                </div>
              </div>

              {/* Información - clickeable para modal */}
              <div
                className="flex-1 p-4 flex flex-col relative cursor-pointer"
                onClick={() => handleCardClick(trabajo)}
              >
                {/* Price */}
                <div className="absolute right-4 top-4 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold shadow-sm border border-primary/20">
                  <span className="text-primary">{trabajo.price?.toLocaleString()} Bs</span>
                </div>

                <div className="mb-2 pr-32">
                  <h3 className="text-base font-semibold text-gray-900 text-left group-hover:text-primary transition-colors">
                    {trabajo.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 text-left leading-relaxed">
                    {trabajo.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {tCat(trabajo.category)}
                    </span>
                    {trabajo.tags && trabajo.tags.length > 0 && (
                      <>
                        {trabajo.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                    <span className="text-xs text-gray-400 font-medium ml-auto">
                      {new Date(trabajo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Información del Fixer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto hover:bg-gray-50 transition-colors">
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handleFixerClick(e, trabajo.fixerId)}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                      {trabajo.fixerPhoto ? (
                        <Image
                          src={trabajo.fixerPhoto}
                          alt={trabajo.fixerName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {trabajo.fixerName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate text-left">
                        {trabajo.fixerName || t('defaultUserName')}
                      </p>
                      {trabajo.rating && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-gray-600">
                            {trabajo.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón WhatsApp */}
                  <button
                    onClick={(e) => handleWhatsAppClick(e, trabajo.contactPhone)}
                    className="flex-shrink-0 bg-[#1AA7ED] hover:bg-[#1AA7ED]/90 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-110 flex items-center gap-2 px-3 py-2"
                    aria-label={t('contactWhatsApp')}
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-medium">{trabajo.contactPhone}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h1 className="text-lg font-semibold mb-4 border-b border-gray-400 pb-2">
        {t('searchResults')}
      </h1>

      {trabajosConImagenes.length === 0 ? (
        <p className="text-gray-500 text-center">{t('noResults')}</p>
      ) : (
        <>
          <div className="lg:hidden">
            <GridView />
          </div>
          <div className="hidden lg:block">{viewMode === 'grid' ? <GridView /> : <ListView />}</div>
        </>
      )}
    </div>
  );
};

export default CardJob;

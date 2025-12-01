// src/Components/Job-offers/JobOfferCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useImageCarousel } from '@/app/redux/features/jobOffers/useImageCarousel';
import type { JobOfferData } from '@/types/jobOffers';
import { SearchHighlight } from '../SearchHighlight';

interface JobOfferCardProps {
  offer: JobOfferData;
  viewMode?: 'grid' | 'list' | string;
  onClick?: (offer: JobOfferData) => void;
  onEdit?: (offer: JobOfferData) => void;
  onDelete?: (id: string) => void;
  className?: string;
  searchQuery?: string;
  readOnly?: boolean;
}

export const JobOfferCard: React.FC<JobOfferCardProps> = ({
  offer,
  viewMode = 'grid',
  onClick,
  onEdit,
  onDelete,
  className = '',
  searchQuery = '',
  readOnly = false,
}) => {
  const router = useRouter();
  const t = useTranslations('cardJob');
  const tCat = useTranslations('Categories');

  // Normalize image sources: ensure strings, leading slash for relative filenames, keep absolute URLs/data URIs
  const normalizeSrc = (src?: any) => {
    if (!src) return null;
    if (typeof src !== 'string') src = String(src);
    const s = src.trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s) || /^data:/i.test(s)) return s;
    if (s.startsWith('/')) return s;
    return '/' + s;
  };

  const images = React.useMemo(() => {
    const imageArray: any[] = [];

    // Recopilar imágenes de diferentes fuentes
    if (offer.allImages && Array.isArray(offer.allImages) && offer.allImages.length > 0) {
      imageArray.push(...offer.allImages);
    } else if (offer.photos && Array.isArray(offer.photos) && offer.photos.length > 0) {
      imageArray.push(...offer.photos);
    } else if (offer.imagenUrl) {
      imageArray.push(offer.imagenUrl);
    }

    // Normalizar y filtrar imágenes válidas
    return imageArray
      .map(normalizeSrc)
      .filter((img): img is string => {
        if (!img || typeof img !== 'string') return false;
        const trimmed = img.trim();
        return trimmed.length > 0;
      });
  }, [offer]);

  const {
    currentIndex,
    isHovered,
    isTouching,
    elementRef,
    handleMouseEnter,
    handleMouseLeave,
    handlePrevImage,
    handleNextImage,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useImageCarousel(offer._id, images.length);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = (
      offer.contactPhone ??
      (offer as any).whatsapp ??
      ''
    )
      .toString()
      .replace(/\D/g, '');
    if (cleanPhone) window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleFixerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (offer.fixerId) {
      router.push(`/fixer/${offer.fixerId}`);
    }
  };

  const handleCardClick = () => {
    if (onClick) onClick(offer);
  };

  const isDashboardMode = !!onEdit || !!onDelete;
  const totalImages = images.length;

  // Render Image Carousel
  const renderImageCarousel = () => (
    <div
      className={`relative overflow-hidden transition-transform ${isTouching ? 'scale-[0.98]' : 'scale-100'} ${
        viewMode === 'grid' ? 'h-48 w-full' : 'w-64 h-full flex-shrink-0'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
    >
      {images.length > 0 ? (
        images.map((img, idx) => {
          // Validación adicional en render
          if (!img || typeof img !== 'string') return null;

          return (
            <Image
              key={idx}
              src={img}
              alt={offer.title ?? 'Oferta'}
              fill
              sizes={
                viewMode === 'grid'
                  ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  : '16rem'
              }
              className={`object-cover transition-all duration-500 ${
                idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              style={{ position: 'absolute' }}
              priority={idx === 0}
              onError={(e) => {
                console.warn(`Failed to load image: ${img}`);
              }}
            />
          );
        })
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
          <span className="text-sm">No image</span>
        </div>
      )}

      {/* Navigation Arrows */}
      {totalImages > 1 && isHovered && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all z-20 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-gray-800" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all z-20 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-4 h-4 text-gray-800" />
          </button>
        </>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Indicators */}
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

      {/* Badges */}
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm border border-primary">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="text-gray-700">{offer.city}</span>
      </div>

      {viewMode === 'grid' && (
        <div className="absolute right-3 top-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold shadow-sm border border-primary/20">
          <span className="text-primary">{offer.price?.toLocaleString()} Bs</span>
        </div>
      )}
    </div>
  );

  // Render Content
  const renderContent = () => (
    <div className={`flex flex-col ${viewMode === 'grid' ? 'p-4' : 'flex-1 p-4 relative'}`}>
      {viewMode === 'list' && (
        <div className="absolute right-4 top-4 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold shadow-sm border border-primary/20">
          <span className="text-primary">{offer.price?.toLocaleString()} Bs</span>
        </div>
      )}

      <div className={viewMode === 'list' ? 'mb-2 pr-32' : ''}>
        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
          <SearchHighlight text={offer.title} searchQuery={searchQuery} />
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
          <SearchHighlight text={offer.description} searchQuery={searchQuery} />
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {offer.category ? tCat(offer.category) : offer.category ?? ''}
          </span>
          {offer.tags && offer.tags.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {offer.tags[0]}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 font-medium ml-auto">
          {new Date(offer.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  // Render Footer
  const renderFooter = () => {
    if (isDashboardMode && !readOnly) {
      return (
        <div className="border-t border-gray-100 p-3 flex items-center justify-end gap-2 bg-gray-50/50">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(offer);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(offer._id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }

    if (readOnly) return null;

    return (
      <div className="border-t border-gray-100 p-3 flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleFixerClick}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
            {(() => {
              const fixerPhotoSrc = normalizeSrc(offer.fixerPhoto as any);
              if (fixerPhotoSrc) {
                return (
                  <Image
                    src={fixerPhotoSrc}
                    alt={offer.fixerName}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                );
              }

              return (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {offer.fixerName?.[0]?.toUpperCase() || 'U'}
                </div>
              );
            })()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {offer.fixerName || t('defaultUserName')}
            </p>
            {offer.rating && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-gray-600">
                  {offer.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleWhatsAppClick}
          className="shrink-0 bg-primary hover:bg-primary/90 rounded-full transition-all shadow-sm flex items-center gap-2 px-3 py-2"
          aria-label={t('contactWhatsApp')}
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-medium">{offer.contactPhone}</span>
        </button>
      </div>
    );
  };

  // Return
  return (
    <div
      ref={elementRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-primary hover:-translate-y-1 ${
        viewMode === 'list' ? 'flex flex-row' : ''
      } ${className}`}
    >
      {viewMode === 'grid' ? (
        <>
          <div onClick={handleCardClick} className="cursor-pointer contents">
            {renderImageCarousel()}
            {renderContent()}
          </div>
          {renderFooter()}
        </>
      ) : (
        <>
          <div onClick={handleCardClick} className="cursor-pointer">
            {renderImageCarousel()}
          </div>
          {/* Contenedor vertical para contenido + footer */}
          <div className="flex flex-col flex-1">
            <div onClick={handleCardClick} className="cursor-pointer flex-1">
              {renderContent()}
            </div>
            {renderFooter()}
          </div>
        </>
      )}
    </div>
  );
};
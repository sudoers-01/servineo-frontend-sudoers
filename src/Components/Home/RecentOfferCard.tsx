// src/Components/Home/RecentOfferCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Star, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OfferData {
  _id: string;
  fixerId: string;
  fixerName: string;
  fixerPhoto?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  city: string;
  contactPhone: string;
  createdAt: string;
  rating?: number;
  allImages?: string[];
}

interface RecentOfferCardProps {
  offer: OfferData;
  onCardClick: (offer: OfferData) => void;
  hoveredCard: string | null;
  currentImageIndex: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function RecentOfferCard({
  offer,
  onCardClick,
  hoveredCard,
  currentImageIndex,
  onMouseEnter,
  onMouseLeave,
}: RecentOfferCardProps) {
  const router = useRouter();
  const tCat = useTranslations('Categories');

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = offer.contactPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleFixerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/fixer/${offer.fixerId || 'fixer-001'}`);
  };

  const totalImages = offer.allImages?.length || 1;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1"
    >
      {/* Área clickeable para modal */}
      <div onClick={() => onCardClick(offer)} className="cursor-pointer">
        {/* Imagen */}
        <div className="h-48 w-full relative overflow-hidden">
          {offer.allImages?.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={offer.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              style={{ position: 'absolute' }}
              priority={idx === 0}
            />
          ))}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Indicadores de imágenes */}
          {totalImages > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {Array.from({ length: totalImages }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* City Badge */}
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium shadow-sm border border-primary">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-gray-700">{offer.city}</span>
          </div>

          {/* Price */}
          <div className="absolute right-3 top-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold shadow-sm border border-primary/20">
            <span className="text-primary">{offer.price?.toLocaleString()} Bs</span>
          </div>
        </div>

        {/* Información de la oferta */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
            {offer.title}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {offer.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {tCat(offer.category)}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {new Date(offer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Información del Fixer */}
      <div className="border-t border-gray-100">
        <div className="p-4 flex items-center justify-between gap-3">
          {/* Perfil clickeable */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleFixerClick}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
              {offer.fixerPhoto ? (
                <Image
                  src={offer.fixerPhoto}
                  alt={offer.fixerName}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {offer.fixerName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {offer.fixerName || 'Usuario'}
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

          {/* Botón WhatsApp */}
          <button
            onClick={handleWhatsAppClick}
            className="flex-shrink-0 bg-[#1AA7ED] hover:bg-[#1AA7ED]/90 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-110 flex items-center gap-2 px-3 py-2 sm:p-2.5"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium sm:hidden">{offer.contactPhone}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import HeroSection from '@/Components/Home/Hero-section';
import ServicesSection from '@/Components/Home/Services-section';
import HowItWorksSection from '@/Components/Home/HowItWorks-section';
import CTASection from '@/Components/Home/CTA-section';
import InspirationSection from '@/Components/Home/Inspiration-section';
import RecentOffersSection from '@/Components/Home/RecentOffer-secction';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/app/Mapa/Map'), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Ancla invisible para el inicio del Tour */}
      <div id="tour-start-point" className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none" />

      {/* Hero Section con ID para el tour */}
      <div id="tour-search-bar">
        <HeroSection />
      </div>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Mapa con ID para el tour */}
          <div id="tour-map-section">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
              Encuentra Servicios Cerca de Ti
              <span className="block text-base md:text-lg font-normal text-gray-600 mt-2 opacity-80">
                Explora los profesionales disponibles en tu zona
              </span>
            </h2>
            <Map />
          </div>

          {/* Inspiración con ID para el tour */}
          <div id="tour-inspiration-section">
            <InspirationSection />
          </div>

          {/* Ofertas recientes con ID para el tour */}
          <div id="tour-recent-offers">
            <RecentOffersSection />
          </div>
        </div>
      </section>

      {/* Servicios con ID para el tour - SOLO 6 servicios en home */}
      <div id="tour-services-section">
        <ServicesSection
          showHero={false}
          showAllServices={false}
          showCTA={false}
          title="Servicios Disponibles"
          subtitle="Encuentra el profesional perfecto para cualquier trabajo en tu hogar"
        />
      </div>

      {/* Cómo funciona con ID para el tour */}
      <div id="tour-how-it-works">
        <HowItWorksSection />
      </div>

      {/* CTA con ID para el tour */}
      <div id="tour-cta-section">
        <CTASection />
      </div>
    </div>
  );
}
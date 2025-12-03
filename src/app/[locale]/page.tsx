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
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <HeroSection />
      <section className='py-16 px-4 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center'>
            Encuentra Servicios Cerca de Ti
            <span className='block text-base md:text-lg font-normal text-gray-600 mt-2 opacity-80'>
              Explora los profesionales disponibles en tu zona
            </span>
          </h2>
          <Map />
          <InspirationSection />
          <RecentOffersSection />
        </div>
      </section>

      <ServicesSection />
      <HowItWorksSection />

      <CTASection />
    </div>
  );
}

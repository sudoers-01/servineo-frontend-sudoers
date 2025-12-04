'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import HeroSection from '@/Components/Home/Hero-section';
import ServicesSection from '@/Components/Home/Services-section';
import HowItWorksSection from '@/Components/Home/HowItWorks-section';
import CTASection from '@/Components/Home/CTA-section';
import InspirationSection from '@/Components/Home/Inspiration-section';
import RecentOffersSection from '@/Components/Home/RecentOffer-secction';

import dynamic from 'next/dynamic';
import { IUser } from '@/types/user';

const Map = dynamic(() => import('@/app/Mapa/Map'), { ssr: false });
interface RootState {
  user: {
    user: IUser | null;
    loading: boolean;
    isAuthenticated: boolean;
  };
}

export default function Home() {
  const { user, loading } = useSelector((state: RootState) => state.user);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!loading) setAuthReady(true);
  }, [loading]);

  if (!authReady) return null;

  const isFixer = user?.role === 'fixer';

  return (
    <div className='min-h-screen bg-white relative'>
      <div
        id='tour-start-point'
        className='absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none'
      />

      {/* Hero cambia según el rol */}
      <HeroSection isFixer={isFixer} />

      <section className={isFixer ? 'bg-white' : 'py-16 px-4 bg-white'}>
        <div className='max-w-7xl mx-auto'>
          {/* Mapa e inspiración solo para requesters */}
          {!isFixer && (
            <>
              <section id='mapa' className='w-full py-16 px-4 bg-gray-50 scroll-mt-24'>
                <div className='max-w-7xl mx-auto text-center'>
                  <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-8'>
                    Encuentra Servicios Cerca de Ti
                  </h2>
                  <Map />
                </div>
              </section>

              <InspirationSection />
            </>
          )}
          <RecentOffersSection />
        </div>
      </section>
      <ServicesSection 
  showHero={false}
  showAllServices={false}
  showCTA={false}
  title="Servicios Disponibles"
  subtitle="Encuentra el profesional perfecto para cualquier trabajo en tu hogar"
       />
      {!isFixer && (
        <>
          <HowItWorksSection />
          <CTASection />
        </>
      )}
    </div>
  );
}
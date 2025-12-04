'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Star, MessageCircle, Share2, Flag, User } from 'lucide-react';
import { PillButton } from '@/Components/Pill-button';
import { CertificationsSection } from '@/Components/fixer/dashboard/CertificationsSection';
import { ExperienceSection } from '@/Components/fixer/dashboard/ExperienceSection';
import { PortfolioSection } from '@/Components/fixer/dashboard/PortfolioSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/Tabs/Tabs';
import EstadisticasTrabajos from '@/Components/fixer/Fixer-statistics';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IUser } from '@/types/user';
import { JobOffersSection } from '@/Components/fixer/dashboard/JobOffersSection';

export default function FixerProfilePage() {
  const params = useParams<{ locale: string; id: string }>();
  const user = useSelector((state: { user: { user: IUser } }) => state.user.user);
  const fixerId = params?.id;
  const [activeTab, setActiveTab] = useState('resumen');
  const fixerData = user?._id === fixerId ? user : null;

  return (
    <div className='min-h-screen bg-gray-50 pb-12'>
      {/* Profile Header */}
      <div className='bg-white border-b'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col md:flex-row gap-6 items-start'>
            {/* Avatar */}
            <div className='relative'>
              <div className='w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gray-200 flex items-center justify-center'>
                {user ? (
                  <Image
                    src={user?.url_photo || '/default-avatar.png'}
                    alt={user?.name || 'Fixer'}
                    width={128}
                    height={128}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User className='w-16 h-16 text-gray-400' />
                )}
              </div>
              {fixerData?.fixerProfile === 'completed' && (
                <div
                  className='absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full ring-2 ring-white'
                  title='Perfil Verificado'
                >
                  <Star className='w-4 h-4 fill-current' />
                </div>
              )}
            </div>

            {/* Info */}
            <div className='flex-1'>
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {user?.name || 'Cargando...'}
                  </h1>
                  <p className='text-lg text-gray-600 font-medium'>
                    {user?.servicios?.join(', ') || 'Servicios Generales'}
                  </p>

                  <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Star className='w-4 h-4 text-amber-400 fill-amber-400' />
                      <span className='font-semibold text-gray-900'>{'N/A'}</span>
                      <span>({'Sin calificaciones aún'})</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      <span>
                        {user?.ubicacion?.departamento ||
                          user?.workLocation?.direccion ||
                          'Bolivia'}
                      </span>
                    </div>
                  </div>

                  {fixerData?.telefono && (
                    <div className='mt-2 text-sm text-gray-600'>
                      <span className='font-semibold'>Teléfono:</span> {fixerData.telefono}
                    </div>
                  )}
                </div>

                <div className='flex gap-3'>
                  <PillButton
                    className='bg-primary text-white hover:bg-blue-800 flex items-center gap-2'
                    onClick={() => {
                      if (fixerData?.telefono) {
                        window.open(
                          `https://wa.me/${fixerData.telefono.replace(/\s+/g, '')}`,
                          '_blank',
                        );
                      }
                    }}
                  >
                    <MessageCircle className='w-4 h-4' />
                    Contactar
                  </PillButton>
                  <button className='p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors'>
                    <Share2 className='w-5 h-5' />
                  </button>
                  <button className='p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors'>
                    <Flag className='w-5 h-5' />
                  </button>
                </div>
              </div>

              {fixerData?.description && (
                <p className='mt-4 text-gray-600 max-w-2xl leading-relaxed'>
                  {fixerData.description}
                </p>
              )}

              {/* Información adicional */}
              <div className='mt-4 flex flex-wrap gap-4 text-sm'>
                {fixerData?.vehiculo?.hasVehiculo && (
                  <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full'>
                    🚗 Vehículo propio
                  </span>
                )}
                {fixerData?.metodoPago?.hasEfectivo && (
                  <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full'>
                    💵 Acepta efectivo
                  </span>
                )}
                {fixerData?.metodoPago?.qr && (
                  <span className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full'>
                    📱 Acepta QR
                  </span>
                )}
                {fixerData?.metodoPago?.tarjetaCredito && (
                  <span className='px-3 py-1 bg-orange-100 text-orange-700 rounded-full'>
                    💳 Acepta tarjeta
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='bg-white p-1 rounded-xl border shadow-sm inline-flex'>
            <TabsTrigger value='resumen' className='px-6'>
              Resumen
            </TabsTrigger>
            <TabsTrigger value='ofertas' className='px-6'>
              Ofertas
            </TabsTrigger>
            <TabsTrigger value='experiencia' className='px-6'>
              Experiencia
            </TabsTrigger>
            <TabsTrigger value='certificaciones' className='px-6'>
              Certificaciones
            </TabsTrigger>
            <TabsTrigger value='portafolio' className='px-6'>
              Portafolio
            </TabsTrigger>
            <TabsTrigger value='estadisticas' className='px-6'>
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value='resumen' className='space-y-8'>
            <JobOffersSection readOnly />
          </TabsContent>

          <TabsContent value='ofertas'>
            <JobOffersSection readOnly />
          </TabsContent>

          <TabsContent value='experiencia'>
            <ExperienceSection fixerId={fixerId as string} readOnly />
          </TabsContent>

          <TabsContent value='certificaciones'>
            <CertificationsSection fixerId={fixerId as string} readOnly />
          </TabsContent>

          <TabsContent value='portafolio'>
            <PortfolioSection fixerId={fixerId as string} readOnly />
          </TabsContent>

          <TabsContent value='estadisticas'>
            <EstadisticasTrabajos />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

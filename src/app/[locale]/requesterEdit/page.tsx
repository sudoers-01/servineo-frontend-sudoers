'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UserPen,
  ShieldCheck,
  KeyRound,
  Smartphone,
  ScanFace,
  Layers
} from 'lucide-react';
import { useAuth } from '@/app/lib/hooks/usoAutentificacion';
import AccountLoginSettings from './linkAccounts/page';
import DispositivosVinculados from './dispositivosVinculados/dispositivosVinculados';
import RequesterEditForm from '@/Components/requester/request/RequesterEditForm';
import ChangePasswordForm from '@/Components/requester/request/ChangePasswordForm';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function ConfiguracionPage() {
  const t = useTranslations('ConfiguracionPage');
  const { user } = useAuth();
  const router = useRouter();

  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  type SafeUser = { name?: string; email?: string; url_photo?: string };
  const safeUser = (user as SafeUser) ?? null;

  function getInitials(name: string) {
    const clean = (name || '').trim();
    if (!clean) return 'U';
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  const loadProfileData = useCallback(async () => {
    if (!user) return;

    setProfileLoading(true);
    setProfileError(null);

    try {
      // fetch datos si necesitas
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.loadProfile');
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (seccionActiva === 'perfil') {
      loadProfileData();
    }
  }, [seccionActiva, loadProfileData]);

  const handlePasswordCancel = () => setSeccionActiva('inicio');
  const handlePasswordSaved = () => setTimeout(() => setSeccionActiva('inicio'), 1500);

  const renderContenido = () => {
    switch (seccionActiva) {
      case 'perfil':
        return (
          <div className='max-w-4xl w-full'>
            <h2 className='text-2xl font-bold text-center mb-8 text-gray-800'>
              {t('sections.editProfile')}
            </h2>
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-200'>
              <RequesterEditForm />
            </div>
          </div>
        );

      case 'password':
        return (
          <div className='max-w-2xl w-full'>
            <h2 className='text-2xl font-bold text-center mb-8 text-gray-800'>
              {t('sections.changePassword')}
            </h2>
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-200'>
              <ChangePasswordForm onCancel={handlePasswordCancel} onSaved={handlePasswordSaved} />
            </div>
          </div>
        );

      case 'dispositivos':
        return (
          <div className='max-w-4xl w-full'>
            <h2 className='text-xl font-semibold text-center mb-4'>Dispositivos Vinculados</h2>
            <DispositivosVinculados />
          </div>
        );

      case 'seguridad':
        return (
          <div className='max-w-4xl w-full'>
            <h2 className='text-xl font-semibold text-center mb-2'>{t('sections.security')}</h2>
            <p className='text-sm text-center text-gray-600 mb-8'>{t('sections.securityDescription')}</p>

            <div className='flex justify-center gap-6'>
              {/* Cambiar contraseña */}
              <button
                onClick={() => setSeccionActiva('password')}
                className='flex items-center gap-3 px-6 py-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer min-w-[220px]'
              >
                <KeyRound className='w-8 h-8 text-blue-600' />
                <span className='font-medium'>{t('security.changePassword')}</span>
              </button>

              {/* Dispositivos */}
              <button
                onClick={() => setSeccionActiva('dispositivos')}
                className='flex items-center gap-3 px-6 py-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer min-w-[220px]'
              >
                <Smartphone className='w-7 h-7 text-blue-600' />
                <span className='font-medium'>{t('security.linkedDevices')}</span>
              </button>

              {/* Authenticator */}
              <button
                onClick={() => router.push('/requesterEdit/Seguridad/Authenticator/')}
                className='flex items-center gap-3 px-6 py-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer min-w-[220px]'
              >
                <ScanFace className='w-7 h-7 text-blue-600' />
                <span className='font-medium'>Authenticator</span>
              </button>
            </div>
          </div>
        );

      case 'cuentas':
        return <AccountLoginSettings token={localStorage.getItem('servineo_token') ?? ''} />;

      default:
        return (
          <div className='flex flex-col items-center justify-top flex-1 mt-10'>
            {safeUser ? (
              <>
                {safeUser.url_photo ? (
                  <Image
                    src={safeUser.url_photo}
                    alt={t('welcome.profilePhoto')}
                    width={112}
                    height={112}
                    className='w-28 h-28 rounded-full border-4 border-blue-100 object-cover mb-4 shadow-sm'
                  />
                ) : (
                  <div className='w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-700 mb-4 shadow-sm border-4 border-blue-200'>
                    {getInitials(safeUser.name ?? safeUser.email ?? '')}
                  </div>
                )}
                <h2 className='text-2xl font-semibold mb-2 text-gray-800'>
                  {t('welcome.title', { name: safeUser.name ?? t('welcome.defaultName') })}
                  <span className='text-blue-600'> {safeUser.name ?? 'Usuario'}</span>
                </h2>
                <p className='text-gray-600 max-w-md text-center'>{t('welcome.description')}</p>
              </>
            ) : (
              <p className='text-gray-600'>{t('welcome.loginRequired')}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className='font-sans flex flex-col min-h-screen bg-gray-50 text-gray-800'>
      <div className='flex flex-1'>
        {/* SIDEBAR */}
        <aside className='w-64 bg-white p-6 flex flex-col justify-between relative shadow-md'>
          <div>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                <button
                  onClick={() => router.back()}
                  className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600'
                >
                  <ArrowLeft className='w-4 h-4' />
                </button>
                {t('title')}
              </h2>
            </div>

            <nav className='space-y-2'>
              <button
                onClick={() => setSeccionActiva('perfil')}
                className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all duration-300 ease-out ${
                  seccionActiva === 'perfil'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-blue-50 hover:text-blue-600 hover:font-semibold'
                }`}
              >
                <UserPen className='w-6 h-6 text-blue-600' />
                {t('navigation.editProfile')}
              </button>

              <button
                onClick={() => setSeccionActiva('seguridad')}
                className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all duration-300 ease-out ${
                  seccionActiva === 'seguridad' || seccionActiva === 'password'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-blue-50 hover:text-blue-600 hover:font-semibold'
                }`}
              >
                <ShieldCheck className='w-7 h-7 text-blue-600' />
                {t('navigation.security')}
              </button>

              <button
                onClick={() => setSeccionActiva('cuentas')}
                className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all duration-300 ease-out ${
                  seccionActiva === 'cuentas'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-blue-50 hover:text-blue-600 hover:font-semibold'
                }`}
              >
                <Layers className='w-7 h-7 text-blue-600' />
                {t('navigation.linkedAccounts')}
              </button>
            </nav>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className='flex-1 flex flex-col items-center text-center p-8 relative'>
          {renderContenido()}
        </main>
      </div>
    </div>
  );
}

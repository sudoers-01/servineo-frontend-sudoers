'use client';

import React, { useState } from 'react';
import FixerRegisterForm from '@/Components/fixer/Fixer-register-form';
import { FixerEnableWizard } from '@/Components/fixer/Filter-eneable-wizard';
import { Navbar } from '@/Components/Shared/Navbar';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/app/redux/hooks';
import { IUser } from '@/types/user';

export default function BecomeFixerPage() {
  const t = useTranslations?.('becomeFixer');
  const { user: reduxUser } = useAppSelector((state) => state.user);
  const [requester, setRequester] = useState<IUser | null>(null);

  // Valores por defecto (si hay user en redux, los usamos; si no, usamos valores por defecto)
  const defaultValues = {
    name: reduxUser?.name || 'Freddy Amin Zapata',
    email: reduxUser?.email || 'zapata@example.com',
    phone: reduxUser?.telefono || '+591 68546043',
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto max-w-4xl p-4">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{t ? t('title') : 'Conviértete en un Fixer'}</h1>
          <p className="text-sm text-gray-500">
            {t ? t('description') : 'Completa tu registro y habilita tu cuenta como FIXER'}
          </p>
        </header>

        <section className="space-y-6">
          {!requester ? (
            <div className="neon-border glass-panel rounded-2xl border border-gray-200 p-4 shadow-sm animate-slide-up">
              <h2 className="mb-3 text-center text-lg font-semibold">
                {t ? t('InputData') : 'Datos iniciales'}
              </h2>

              <FixerRegisterForm
                defaultValues={defaultValues}
                onSubmit={(data) => {
                  const { name, email, phone } = data;
                  // Use redux ID if available, else fallback id
                  const _id = reduxUser?._id  ?? 'req-guest';
                  const url_photo = reduxUser?.url_photo ?? 'https://picsum.photos/80';

                  // Construimos el objeto IUser mínimo (ajusta campos si tu IUser requiere otros)
                  const user: IUser = {
                    _id,
                    name,
                    email,
                    telefono: phone,
                    url_photo,
                    role: 'requester',
                    // si el IUser tiene campos obligatorios adicionales, completa con valores por defecto o extrae desde reduxUser
                  } as IUser;

                  setRequester(user);
                }}
                submitButtonText={t ? t('button1') : 'Continuar'}
              />
            </div>
          ) : (
            <div className="animate-fade-in">
              <FixerEnableWizard user={requester} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import ReCAPTCHA from 'react-google-recaptcha';
import ErrorMessage from './ErrorMessage';

const BotonWhatsapp = () => {
  const [showError, setShowError] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const sitekey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const numerowhapi = '59178194834';
  const mensaje = '';
  const encodedMessage = encodeURIComponent(mensaje);
  const whatsappUrl = `https://wa.me/${numerowhapi}?text=${encodedMessage}`;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const handleInitialClick = () => {
    if (!navigator.onLine) {
      setShowError(true);
      return;
    }

    if (!sitekey) {
      console.error('Falta NEXT_PUBLIC_RECAPTCHA_SITE_KEY para renderizar ReCAPTCHA.');
      setShowError(true);
      return;
    }

    setShowCaptcha(true);
  };

  const handleCaptchaChange = async (token: string | null) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/verify-captcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setTimeout(() => {
          setShowCaptcha(false);
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }, 1000);
      } else {
        alert('Verificación fallida. Las claves no coinciden o el token expiró.');
        recaptchaRef.current?.reset();
      }
    } catch (error) {
      console.error('Error conectando con el backend:', error);
      setShowError(true);
      setShowCaptcha(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        type='button'
        onClick={handleInitialClick}
        className='flex items-center justify-center
                        w-13 h-13
                        bg-[#2563EB] hover:bg-[#1D4ED8]
                        rounded-full shadow-lg
                        transition duration-300 transform hover:scale-105
                        cursor-pointer'
        aria-label='Contactar por WhatsApp'
      >
        <Image
          src='https://drive.google.com/uc?export=view&id=1jmTcbSdFJdlMmUPZj3bUwahLGTZIdPI4'
          alt='Logo de WhatsApp'
          width={52}
          height={52}
        />
      </button>

      {/* 5. Modal / Overlay del Captcha */}
      {showCaptcha && sitekey && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='bg-white p-6 rounded-lg shadow-xl relative flex flex-col items-center gap-4'>
            <h3 className='text-lg font-semibold text-gray-700'>Verificación de seguridad</h3>
            <p className='text-sm text-gray-500 mb-2'>Confirma que eres humano para continuar.</p>

            <ReCAPTCHA ref={recaptchaRef} sitekey={sitekey} onChange={handleCaptchaChange} />

            {/* Botón para cerrar */}
            <button
              onClick={() => setShowCaptcha(false)}
              className='text-gray-400 hover:text-gray-600 text-sm mt-2 underline'
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showError && (
        <ErrorMessage
          message={
            sitekey
              ? 'Hubo un problema de conexión. Intenta más tarde.'
              : 'Configuración incompleta: falta NEXT_PUBLIC_RECAPTCHA_SITE_KEY para mostrar el reCAPTCHA.'
          }
          onClose={() => setShowError(false)}
        />
      )}
    </>
  );
};

export default BotonWhatsapp;

// src/Components/Navigation/TopMenu.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Wrench, ClipboardList, HelpCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/app/redux/slice/userSlice';
import type { IUser } from '@/types/user';

interface RootState {
  user: { user: IUser | null };
}

export default function TopMenu() {
  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((s: RootState) => s.user || { user: null });

  const [scrolled, setScrolled] = useState(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [userData, setUserData] = useState<IUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLButtonElement | null>(null);

  const navItems = [
    { name: 'Servicios', href: '/servicios', icon: <Wrench className='h-5 w-5' /> },
    { name: 'Ofertas de trabajo', href: '/job-offer-list', icon: <ClipboardList className='h-5 w-5' /> },
    { name: 'Ayuda', href: '/ask-for-help/centro_de_ayuda', icon: <HelpCircle className='h-5 w-5' /> },
  ];

  // detectar scroll para sombra del header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // leer user desde localStorage al cargar (si existe)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('servineo_user');
      if (raw) {
        const parsed = JSON.parse(raw) as IUser;
        setUserData(parsed);
        setIsLogged(true);
        // opcional: sincronizar con redux si hace falta
        dispatch(setUser(parsed));
      } else {
        setUserData(null);
        setIsLogged(false);
      }
    } catch (err) {
      setUserData(null);
      setIsLogged(false);
    }
  }, [dispatch]);

  // cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => (window.location.href = '/');
  const logout = () => {
    localStorage.removeItem('servineo_token');
    localStorage.removeItem('servineo_user');
    setIsLogged(false);
    setUserData(null);
    // refrescar o redirigir al home
    window.location.href = '/';
  };

  const getRoleButton = () => {
    // Mantener opción de "Ir a panel" según rol (ejemplo)
    if (!userData) return null;
    if (userData.role === 'fixer') {
      return (
        <Link href='/fixer/dashboard' className='px-3 py-2 rounded-md text-sm bg-white border border-gray-200 hover:bg-gray-50'>
          Mi Panel
        </Link>
      );
    }
    return (
      <Link href='/requesterEdit' className='px-3 py-2 rounded-md text-sm bg-white border border-gray-200 hover:bg-gray-50'>
        Mi Cuenta
      </Link>
    );
  };

  return (
    <>
      {/* DESKTOP HEADER */}
      <header
        className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white'
        } border-b border-gray-100`}
        role='banner'
      >
        <div className='w-full max-w-8xl mx-auto px-4 flex items-center h-16'>
          {/* Logo */}
          <button
            ref={logoRef}
            onClick={handleLogoClick}
            className='flex items-center gap-2 group transition-transform duration-300 hover:scale-105 focus:outline-none'
            aria-label='Ir al inicio'
          >
            <div className='relative overflow-hidden rounded-full shadow-md'>
              <Image src='/es/img/icon.png' alt='Logo de Servineo' width={40} height={40} className='transition-transform duration-300 group-hover:scale-110' />
            </div>
            <span className='text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]'>
              Servineo
            </span>
          </button>

          {/* Desktop Nav */}
          <div className='flex-1 flex justify-center'>
            <nav className='flex gap-6' role='navigation' aria-label='Menú principal'>
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className='font-medium text-gray-900 hover:text-[var(--color-primary)]'>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth Buttons (solo una vez) */}
          <div className='flex items-center gap-3'>
            {/* Este id lo usa la guía interactiva — SOLO UNA INSTANCIA para desktop */}
            <div id='tour-auth-buttons-desktop' className='hidden md:flex items-center gap-3'>
              {!isLogged ? (
                <>
                  <Link href='/login' className='px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-medium hover:opacity-90'>
                    Iniciar Sesión
                  </Link>
                  <Link href='/signUp' className='px-4 py-2 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] font-medium hover:opacity-80'>
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  {getRoleButton()}
                  <div className='relative' ref={dropdownRef}>
                    <button onClick={() => setAccountOpen(!accountOpen)} className='flex items-center gap-2 cursor-pointer px-3 py-1 border border-gray-300 bg-white rounded-xl'>
                      <span className='font-medium text-gray-700 hover:text-primary'>{userData?.name}</span>
                    </button>
                    {accountOpen && (
                      <div className='absolute right-0 mt-2 w-44 bg-white shadow-lg border border-gray-200 rounded-md py-2 z-50'>
                        <Link href='/requesterEdit' className='block px-4 py-2 text-gray-700 hover:bg-gray-50'>
                          Editar perfil
                        </Link>
                        <button onClick={logout} className='w-full text-left px-4 py-2 text-red-600 hover:bg-red-50'>
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE/TABLET HEADER */}
      <div className='lg:hidden'>
        {/* Barra superior móvil */}
        <div className='flex items-center justify-between px-3 py-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50'>
          <button onClick={handleLogoClick} className='flex items-center gap-2 min-w-0'>
            <div className='relative overflow-hidden rounded-full shadow-md shrink-0'>
              <Image src='/es/img/icon.png' alt='Servineo' width={32} height={32} />
            </div>
            <span className='text-lg sm:text-xl font-bold truncate' style={{ background: 'linear-gradient(90deg,var(--color-primary),var(--color-primary))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Servineo
            </span>
          </button>

          {/* Auth Buttons móviles (solo una instancia) */}
          <div id='tour-auth-buttons-mobile' className='flex items-center gap-2 flex-nowrap'>
            {!isLogged ? (
              <>
                <Link href='/login' className='px-3 py-2 rounded-md text-[var(--color-primary)] font-medium text-[11px] sm:text-sm hover:opacity-90'>
                  Iniciar sesión
                </Link>
                <Link href='/signUp' className='px-3 py-2 rounded-md bg-[var(--color-primary)] text-white font-medium text-[11px] sm:text-sm hover:opacity-90'>
                  Registrarse
                </Link>
              </>
            ) : (
              <button onClick={() => setAccountOpen(!accountOpen)} className='flex items-center gap-2 cursor-pointer px-3 py-1 border border-gray-300 bg-white rounded-xl'>
                <span className='text-gray-700 font-medium'>{userData?.name}</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra inferior fija con iconos (móvil) */}
        <nav className='fixed bottom-0 left-0 right-0 h-16 border-t border-gray-200 bg-white/95 backdrop-blur-sm flex justify-around items-center z-50'>
          {navItems.map((item) => (
            <button key={item.name} onClick={() => (window.location.href = item.href)} className='flex flex-col items-center text-[11px] px-1 py-1'>
              <div className='w-6 h-6 flex items-center justify-center'>{item.icon}</div>
              <span className='truncate'>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

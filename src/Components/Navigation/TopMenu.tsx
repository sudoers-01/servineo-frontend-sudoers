'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Wrench, UserCircle } from 'lucide-react';
import { useGetUserByIdQuery } from '@/app/redux/services/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/app/redux/slice/userSlice';
import { IUser } from '@/types/user';

interface UserState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface RootState {
  user: UserState;
}

export default function TopMenu() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLButtonElement | null>(null);

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Ofertas de trabajo', href: '/job-offer-list' },
    { name: 'Ayuda', href: '/ask-for-help/centro_de_ayuda' },
  ];

  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname); // Solo se ejecuta en el cliente
  }, []);
  // Obtener userId desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('servineo_user');
    if (token) {
      const userData = JSON.parse(token);
      setUserId(userData._id);
    }
  }, []);

  // Consultar user por ID
  const { data: userData } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });

  // Guardar user en redux
  useEffect(() => {
    if (userData) dispatch(setUser(userData));
  }, [userData, dispatch]);

  // Detectar scroll y login
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const token = localStorage.getItem('servineo_token');
    setIsLogged(!!token);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función logout
  const logout = () => {
    localStorage.removeItem('servineo_token');
    localStorage.removeItem('servineo_user');
    window.location.reload();
  };

  // Botones por rol
  const getRoleButton = () => {
    if (loading || !user) return null;
    if (!user.role) return null;

    if (user.role === 'requester') {
      return (
        <Link
          href="/become-fixer"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          <Wrench className="h-4 w-4" />
          Convertir a Fixer
        </Link>
      );
    }

    if (user.role === 'fixer') {
      return (
        <Link
          href="/fixer/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <UserCircle className="h-4 w-4" />
          Perfil de Fixer
        </Link>
      );
    }
    return null;
  };

  const getRoleButtonMobile = () => {
    if (loading || !user) return null;
    if (!user.role) return null;

    if (user.role === 'requester') {
      return (
        <Link
          href="/become-fixer"
          className="flex items-center justify-center gap-2 w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-md text-base font-medium hover:opacity-90 transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <Wrench className="h-4 w-4" />
          Convertir a Fixer
        </Link>
      );
    }

    if (user.role === 'fixer') {
      return (
        <Link
          href="/fixer/dashboard"
          className="flex items-center justify-center gap-2 w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-md text-base font-medium hover:opacity-90 transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <UserCircle className="h-4 w-4" />
          Perfil de Fixer
        </Link>
      );
    }
    return null;
  };

  // Scroll al top desde logo
  const handleLogoClick = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/';
    }
  };

  // Navegación con flechas en desktop
  const handleDesktopNavKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const logoItems = logoRef.current ? [logoRef.current] : [];
    const navItemsEls = Array.from(
      document.querySelectorAll<HTMLElement>(
        'nav[aria-label="Menú principal"] a, nav[aria-label="Menú principal"] [href]',
      ),
    );
    const buttonItems = Array.from(
      document.querySelectorAll<HTMLElement>(
        '#desktop-auth-buttons a, #desktop-auth-buttons button',
      ),
    );

    const allItems: HTMLElement[] = [...logoItems, ...navItemsEls, ...buttonItems];
    if (allItems.length === 0) return;

    const index = allItems.indexOf(document.activeElement as HTMLElement);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = index === -1 ? 0 : (index + 1) % allItems.length;
      allItems[next].focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev =
        index === -1 ? allItems.length - 1 : (index - 1 + allItems.length) % allItems.length;
      allItems[prev].focus();
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white'
        } border-b border-gray-100`}
        role="banner"
      >
        <div
          className="w-full max-w-8xl mx-auto px-4 flex justify-between items-center h-20"
          onKeyDown={handleDesktopNavKeyDown}
        >
          {/* Logo */}
          <button
            ref={logoRef}
            onClick={handleLogoClick}
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
            aria-label="Ir al inicio"
          >
            <div className="relative overflow-hidden rounded-full shadow-md">
              <Image
                src="/icon.png"
                alt="Logo de Servineo"
                width={40}
                height={40}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span
              className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Servineo
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6" role="navigation" aria-label="Menú principal">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[var(--color-primary)] after:transition-all
                  ${
                    currentPath === item.href
                      ? 'text-[var(--color-primary)] after:w-full'
                      : 'text-gray-900 hover:text-[var(--color-primary)] after:w-0 hover:after:w-full'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4" id="desktop-auth-buttons">
            {!isLogged ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-medium transition-opacity duration-300 hover:opacity-90"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/signUp"
                  className="px-4 py-2 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] font-medium transition-opacity duration-300 hover:opacity-80"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                {getRoleButton()}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 cursor-pointer ml-[-20px] px-3 py-1 border border-gray-300 bg-white rounded-xl transition"
                  >
                    <span className="font-medium text-gray-700 hover:text-primary">
                      {user?.name}
                    </span>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg border border-gray-200 rounded-md py-2 z-50">
                      <Link
                        href="/requesterEdit"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Editar perfil
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white border-t border-gray-200`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 pb-2 border-t border-gray-200 px-2 space-y-2">
              {!isLogged ? (
                <>
                  <Link
                    href="/login"
                    className="block w-full text-center text-white bg-[var(--color-primary)] px-4 py-2 rounded-md text-base font-medium hover:opacity-90"
                    onClick={() => setIsOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/signUp"
                    className="block w-full text-center text-white bg-[var(--color-primary)] px-4 py-2 rounded-md text-base font-medium hover:opacity-90"
                    onClick={() => setIsOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  {getRoleButtonMobile()}
                  <Link
                    href="/requesterEdit"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Editar perfil
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left text-red-600 px-4 py-2 rounded-md text-base font-medium hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para header fijo */}
      <div className="h-20" />
    </>
  );
}

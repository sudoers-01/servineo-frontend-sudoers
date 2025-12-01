'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Wallet, LogOut, User as UserIcon, Shield, ChevronDown, Briefcase, Home, HelpCircle } from 'lucide-react';
import { UserData } from '@/types/User';

// Extendemos la interfaz por si acaso
interface ExtendedUserData extends UserData {
  _id?: string;
  id?: string;
}

export default function TopMenu() {
  // --- ESTADOS DE UI (Estilo Repo General) ---
  const [isOpen, setIsOpen] = useState(false); // Mobile menu
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false); // Dropdown desktop

  // --- ESTADOS DE LÓGICA (Tu Repo - LocalStorage) ---
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState<ExtendedUserData | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Detectar si estamos en flujo de auth para ocultar botones si quieres (opcional)
  const isInAuthFlow = pathname?.startsWith('/signUp') || pathname === '/login';

  // Foto de perfil con fallback
  const userPhoto =
    userData?.photo?.trim() ||
    userData?.picture?.trim() ||
    userData?.url_photo?.trim() ||
    '/no-photo.png';

  // ----------------------------------------------------------------------
  // 1. EFECTOS Y LÓGICA (Tuya, para que no se rompa la app)
  // ----------------------------------------------------------------------

  // Detectar Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cargar Usuario y Token
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('servineo_token');
      const user = localStorage.getItem('servineo_user');
      setIsLogged(!!token);
      
      try {
        if (user && user !== 'undefined') {
          setUserData(JSON.parse(user));
        } else {
          setUserData(null);
        }
      } catch {
        setUserData(null);
      }
    };

    checkAuth();
    setAuthReady(true);

    // Sincronizar entre pestañas
    window.addEventListener('storage', checkAuth);
    window.addEventListener('servineo_user_updated', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('servineo_user_updated', checkAuth);
    };
  }, [pathname]);

  // Click Outside para cerrar dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto Logout (Tu lógica original)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isLogged) logout(true);
      }, 15 * 60 * 1000); // 15 min
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    if (isLogged) resetTimer();
    
    return () => {
        clearTimeout(timer);
        events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isLogged]);

  // ----------------------------------------------------------------------
  // 2. FUNCIONES DE ACCIÓN
  // ----------------------------------------------------------------------

  const logout = (expired = false) => {
    let email = '';
    try {
        const raw = localStorage.getItem('servineo_user');
        email = raw ? (JSON.parse(raw)?.email ?? '') : '';
    } catch {}

    localStorage.removeItem('servineo_token');
    localStorage.removeItem('servineo_user');
    setIsLogged(false);
    setUserData(null);
    setAccountOpen(false);
    setIsOpen(false);

    if (expired) {
        sessionStorage.setItem('session_expired', '1');
        if (email) sessionStorage.setItem('prefill_email', email);
        window.dispatchEvent(new Event('servineo_user_updated'));
        router.push(`/login?expired=1`);
    } else {
        window.location.href = '/'; 
    }
  };

  const goToPaymentCenter = () => {
    const userId = userData?._id || userData?.id;
    if (userId) {
      router.push(`/payment/centro-de-pagos?fixerId=${userId}`);
      setAccountOpen(false);
      setIsOpen(false);
    } else {
      console.error("No se encontró el ID del usuario");
    }
  };

  // ----------------------------------------------------------------------
  // 3. ITEMS DE NAVEGACIÓN
  // ----------------------------------------------------------------------

  const navItems = [
    { name: "Inicio", href: "/", icon: <Home size={18}/> },
    { name: "Ofertas de trabajo", href: "/job-offer-list", icon: <Briefcase size={18}/> },
    { name: "Ayuda", href: "/ayuda", icon: <HelpCircle size={18}/> },
  ];

  if (!authReady) return null;

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white/90 backdrop-blur-sm"
        } border-b border-gray-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* LOGO */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
               <div className="relative w-8 h-8 overflow-hidden rounded-full shadow-sm">
                  <Image src="/icon.png" alt="Servineo" fill className="object-cover" />
               </div>
              <span className="text-blue-600 font-bold text-xl tracking-tight">
                SERVINEO
              </span>
            </div>

            {/* NAV DESKTOP (CENTRAL) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Items adicionales solo para FIXER en Desktop */}
              {userData?.role === 'fixer' && (
                 <Link
                    href="/fixer/my-offers"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === '/fixer/my-offers' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                 >
                    Mis Ofertas
                 </Link>
              )}
            </nav>

            {/* DERECHA (AUTH / PERFIL) */}
            <div className="hidden md:flex items-center space-x-4">
              {isInAuthFlow ? (
                 <div className="w-4" /> 
              ) : !isLogged ? (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/signUp"
                    className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                  >
                    Regístrate
                  </Link>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-2 py-1 rounded-full border border-transparent hover:border-gray-200 transition-all focus:outline-none"
                  >
                    <img
                        src={userPhoto}
                        alt="Perfil"
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                    <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block">
                        {userData?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={16} />
                  </button>

                  {/* DROPDOWN MENU DESKTOP */}
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white shadow-xl border border-gray-100 rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                      
                      <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            {userData?.role === 'fixer' ? 'Cuenta Fixer' : 'Cuenta Cliente'}
                        </p>
                        <p className="text-sm font-medium text-gray-800 truncate" title={userData?.email}>
                            {userData?.email}
                        </p>
                      </div>

                      {/* Opciones Cliente */}
                      {userData?.role !== 'fixer' && (
                        <>
                            <Link href="/mi-perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                                <UserIcon size={16} className="mr-2" /> Editar Perfil
                            </Link>
                            <Link href="/become-fixer" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                                <Shield size={16} className="mr-2" /> Convertirse en Fixer
                            </Link>
                            <Link href="/payment/trabajos" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                                <Briefcase size={16} className="mr-2" /> Mis Trabajos
                            </Link>
                        </>
                      )}

                      {/* Opciones Fixer */}
                      {userData?.role === 'fixer' && (
                        <>
                            <Link href="/fixer/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                                <UserIcon size={16} className="mr-2" /> Perfil Profesional
                            </Link>
                            {/* BOTÓN CENTRO DE PAGOS */}
                            <button 
                                onClick={goToPaymentCenter}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                            >
                                <Wallet size={16} className="mr-2 text-blue-600" /> 
                                <span className="font-medium text-blue-600">Centro de Pagos</span>
                            </button>
                            <Link href="/payment/Pagos-Fisico" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                                <Shield size={16} className="mr-2" /> Confirmar Pagos
                            </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                            onClick={() => logout(false)}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                            <LogOut size={16} className="mr-2" /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BOTÓN HAMBURGUESA MOBILE */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------- */}
        {/* MOBILE MENU (Desplegable) */}
        {/* ------------------------------------------- */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"} bg-white border-t border-gray-200 shadow-lg`}>
          <div className="px-4 pt-4 pb-6 space-y-2">
            
            {/* Nav Items Generales */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3 text-gray-400">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {/* Item específico Fixer Mobile */}
            {isLogged && userData?.role === 'fixer' && (
                 <Link
                    href="/fixer/my-offers"
                    className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                 >
                    <span className="mr-3 text-gray-400"><Briefcase size={18}/></span>
                    Mis Ofertas
                 </Link>
            )}

            <div className="border-t border-gray-100 my-4 pt-4">
              {isInAuthFlow ? null : !isLogged ? (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/signUp"
                    className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Regístrate
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                   <div className="flex items-center gap-3 px-3 pb-4 mb-2 border-b border-gray-100">
                        <img src={userPhoto} alt="User" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-semibold text-gray-800">{userData?.name}</p>
                            <p className="text-xs text-gray-500">{userData?.role === 'fixer' ? 'Fixer' : 'Cliente'}</p>
                        </div>
                   </div>

                   {/* Opciones Móviles Específicas */}
                   {userData?.role !== 'fixer' ? (
                        <>
                            <Link href="/mi-perfil" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-md">
                                <UserIcon size={18} className="mr-3"/> Editar Perfil
                            </Link>
                            <Link href="/become-fixer" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-md">
                                <Shield size={18} className="mr-3"/> Ser Fixer
                            </Link>
                            <Link href="/payment/trabajos" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-md">
                                <Wallet size={18} className="mr-3"/> Mis Trabajos
                            </Link>
                        </>
                   ) : (
                        <>
                            <Link href="/fixer/profile" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-md">
                                <UserIcon size={18} className="mr-3"/> Mi Perfil
                            </Link>
                            <button 
                                onClick={goToPaymentCenter}
                                className="w-full text-left flex items-center px-3 py-3 text-blue-600 bg-blue-50 font-medium rounded-md"
                            >
                                <Wallet size={18} className="mr-3"/> Centro de Pagos
                            </button>
                            <Link href="/payment/Pagos-Fisico" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-md">
                                <Shield size={18} className="mr-3"/> Confirmar Pagos
                            </Link>
                        </>
                   )}

                  <button
                    onClick={() => logout(false)}
                    className="w-full text-left flex items-center px-3 py-3 text-red-600 font-medium hover:bg-red-50 rounded-md mt-4"
                  >
                    <LogOut size={18} className="mr-3"/> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Espaciador para no tapar contenido */}
      <div className="h-16" />
    </>
  );
}
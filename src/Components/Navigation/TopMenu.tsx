'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, Wrench, UserCircle, Home, Briefcase, HelpCircle, Wallet, Shield, LogOut, ChevronDown } from 'lucide-react';
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
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { user, loading } = useSelector((state: RootState) => state.user);

  // Estados de UI
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLButtonElement | null>(null);

  const goToPaymentCenter = () => {
    
    if (user?._id) {
      router.push(`/payment/centro-de-pagos?fixerId=${user._id}`);
      setAccountOpen(false);
      setIsOpen(false);
    } else {
      console.error("No se encontró el ID del usuario para ir al centro de pagos");
    }
  };

  const navItems = [
    { name: 'Inicio', href: '/', icon: <Home className='h-5 w-5' /> },
    { name: 'Ofertas de trabajo', href: '/job-offer-list', icon: <Briefcase className='h-5 w-5' /> },
    { name: 'Ayuda', href: '/ask-for-help/centro_de_ayuda', icon: <HelpCircle className='h-5 w-5' /> },
  ];

  // Obtener userId desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('servineo_user');
    if (token) {
      try {
        const userData = JSON.parse(token);
        setUserId(userData._id || userData.id);
      } catch (e) {
        console.error("Error parsing user token", e);
      }
    }
  }, []);

  // Consultar user por ID (RTK Query)
  const { data: userData } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });

  // Guardar user en redux
  useEffect(() => {
    if (userData) dispatch(setUser(userData));
  }, [userData, dispatch]);

  // Scroll y login
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

  const logout = () => {
    localStorage.removeItem('servineo_token');
    localStorage.removeItem('servineo_user');
    window.location.href = '/';
  };

  const handleLogoClick = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  // --- RENDERIZADO ---

  return (
    <>
      {/* DESKTOP HEADER */}
      <header
        className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white/10 backdrop-blur-md'
        } border-b border-gray-100`}
        role='banner'
      >
        <div className='w-full max-w-7xl mx-auto px-4 flex items-center justify-between h-16'>
          
          {/* Logo */}
          <button
            ref={logoRef}
            onClick={handleLogoClick}
            className='flex items-center gap-2 group transition-transform duration-300 hover:scale-105 focus:outline-none'
            aria-label='Ir al inicio'
          >
            <div className='relative overflow-hidden rounded-full shadow-sm w-10 h-10'>
              <Image
                src='/icon.png' 
                alt='Logo'
                fill
                className='object-cover'
              />
            </div>
            <span className='text-xl font-bold text-blue-600 tracking-tight'>
              SERVINEO
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className='flex gap-6 items-center'>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm'
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            {/* Link extra para Fixers */}
            {user?.role === 'fixer' && (
               <Link
                 href='/fixer/my-offers'
                 className='flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm'
               >
                 <Briefcase className='h-5 w-5' />
                 Mis Ofertas
               </Link>
            )}
          </nav>

          {/* Desktop Right (Auth & Dropdown) */}
          <div className='flex items-center gap-4'>
            {!isLogged ? (
              <>
                <Link
                  href='/login'
                  className='text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href='/signUp'
                  className='bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-shadow shadow-sm hover:shadow-md'
                >
                  Regístrate
                </Link>
              </>
            ) : (
              <div className='relative' ref={dropdownRef}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className='flex items-center gap-2 px-2 py-1 rounded-full border border-transparent hover:border-gray-200 transition-all'
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 relative">
                     <Image 
                        src={user?.url_photo || '/no-photo.png'} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                     />
                  </div>
                  <span className='text-sm font-medium text-gray-700 hidden xl:block'>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* DROPDOWN MENU */}
                {accountOpen && (
                  <div className='absolute right-0 mt-2 w-64 bg-white shadow-xl border border-gray-100 rounded-xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
                    
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {user?.role === 'fixer' ? 'Cuenta Fixer' : 'Cuenta Cliente'}
                        </p>
                        <p className="text-sm text-gray-700 truncate">{user?.email}</p>
                    </div>

                    {/* OPCIONES COMUNES */}
                    <Link href='/requesterEdit' className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600'>
                        <UserCircle className="h-4 w-4" /> Editar Perfil
                    </Link>

                    {/* OPCIONES CLIENTE */}
                    {user?.role === 'requester' && (
                        <Link href='/become-fixer' className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600'>
                            <Wrench className="h-4 w-4" /> Convertirse en Fixer
                        </Link>
                    )}

                    {/* OPCIONES FIXER (Integradas de tu repo) */}
                    {user?.role === 'fixer' && (
                        <>
                            <Link href='/fixer/dashboard' className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600'>
                                <UserCircle className="h-4 w-4" /> Dashboard
                            </Link>
                            
                            {/* BOTÓN CENTRO DE PAGOS */}
                            <button 
                                onClick={goToPaymentCenter}
                                className='w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            >
                                <Wallet className="h-4 w-4" /> Centro de Pagos
                            </button>

                            <Link href='/payment/Pagos-Fisico' className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600'>
                                <Shield className="h-4 w-4" /> Confirmar Pagos
                            </Link>
                        </>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                        onClick={logout}
                        className='w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                        >
                        <LogOut className="h-4 w-4" /> Cerrar sesión
                        </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <div className='lg:hidden'>
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50'>
          
          <button onClick={handleLogoClick} className='flex items-center gap-2'>
             <div className='relative w-8 h-8 rounded-full overflow-hidden'>
                <Image src='/icon.png' alt='Servineo' fill className='object-cover' />
             </div>
             <span className='font-bold text-blue-600 text-lg'>SERVINEO</span>
          </button>

          <div className="flex items-center gap-3">
             {/* Botón menú hamburguesa */}
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none"
             >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
            <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-40 max-h-[80vh] overflow-y-auto">
                <div className="p-4 space-y-4">
                    {/* Navegación básica */}
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 font-medium"
                            >
                                {item.icon} {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        {!isLogged ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/login" className="flex justify-center py-2 border border-gray-300 rounded-lg text-gray-700 font-medium">
                                    Ingresar
                                </Link>
                                <Link href="/signUp" className="flex justify-center py-2 bg-blue-600 text-white rounded-lg font-medium">
                                    Registrarse
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                        <Image src={user?.url_photo || '/no-photo.png'} alt="User" fill className="object-cover"/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                </div>

                                {user?.role === 'fixer' && (
                                    <>
                                        <button 
                                            onClick={goToPaymentCenter}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium"
                                        >
                                            <Wallet className="h-5 w-5" /> Centro de Pagos
                                        </button>
                                        <Link href="/payment/Pagos-Fisico" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700 font-medium">
                                            <Shield className="h-5 w-5" /> Confirmar Pagos
                                        </Link>
                                    </>
                                )}

                                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium">
                                    <LogOut className="h-5 w-5" /> Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Espaciadores */}
        <div className='h-14' /> 
      </div>

      {/* Spacer Desktop */}
      <div className='hidden lg:block h-16' />
    </>
  );
}
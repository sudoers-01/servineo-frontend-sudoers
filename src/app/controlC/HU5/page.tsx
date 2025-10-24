'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Settings } from 'lucide-react'
import RequesterEditForm from './RequesterEditForm' // Asegúrate de que esta ruta es correcta
import { useAuth } from '../HU3/hooks/usoAutentificacion' // 👈 Importa tu hook de autenticación
import { obtenerDatosUsuarioLogueado, RequesterData } from './service/api' // 👈 Importa tus servicios de backend

// Define la estructura de datos que esperas
interface RequesterDataState {
  requesterId: string;
  telefono: string;
  direction: string;
  coordinates: [number, number];
}

// Estado inicial
const INITIAL_DATA: RequesterDataState = {
  requesterId: '',
  telefono: '',
  direction: '',
  coordinates: [0, 0],
}


export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth() 
  const [profileData, setProfileData] = useState<RequesterDataState>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfileData = useCallback(async () => {
    if (authLoading || !user) return

    setLoading(true)
    setError(null)
    try {
      const data: RequesterDataState = await obtenerDatosUsuarioLogueado() as RequesterDataState
      setProfileData(data)
    } catch (e: any) {
      setError(e.message || 'Error al cargar los datos del perfil.')
      setProfileData(INITIAL_DATA)
    } finally {
      setLoading(false)
    }
  }, [authLoading, user])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])


  const handleSave = () => {
    loadProfileData() 
    alert('Cambios guardados!')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F5FAFE] flex items-center justify-center">
        <p className="text-[#2B6AE0]">Cargando datos del perfil...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#F5FAFE] p-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-red-600">
          {user ? 'Error de Carga' : 'Acceso Denegado'}
        </h1>
        <p className="text-[#1A223F]">
          {user ? `No se pudo cargar el perfil: ${error}` : 'Por favor, inicie sesión para ver esta página.'}
        </p>
        {user && <button 
            onClick={loadProfileData} 
            className="mt-4 p-2 bg-[#1AA7ED] text-white rounded hover:bg-[#2B6AE0] transition"
        >
            Reintentar Carga
        </button>}
      </div>
    )
  }
  

  return (
    <div className="min-h-screen bg-[#F5FAFE]">
      <header className="flex justify-between items-center p-4 shadow bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-[#E5F4FB]">
        <div className="text-2xl font-bold tracking-wide ml-6" style={{ color: '#1A223F' }}>
          Servineo
        </div>

        <div className="flex items-center gap-4">
          <button
            title="Ajustes"
            className="p-2 rounded-md hover:bg-[#E5F4FB] transition cursor-pointer"
          >
            <Settings size={22} className="text-[#1AA7ED]" />
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#E5F4FB] w-9 h-9 flex items-center justify-center">
              <User size={18} className="text-[#2B6AE0]" />
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-sm font-medium" style={{ color: '#1A223F' }}>{user.name || user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-5 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A223F' }}>
          Editar Perfil
        </h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E5F4FB]">
          <RequesterEditForm
          
          />
        </div>
      
      </main>

      <footer className="text-center p-4 text-[#759AE0] text-sm border-t border-[#E5F4FB]">
        &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
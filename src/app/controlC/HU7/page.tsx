'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../HU3/hooks/usoAutentificacion'
import AccountLoginSettings from './registrarVinculo/cuentas'
import RequesterEditForm from '../HU5/RequesterEditForm'
import { ArrowLeft } from 'lucide-react'

const MockAvatar = ({ src, alt }: { src?: string; alt: string }) => (
  <img
    src={src || 'https://via.placeholder.com/80'}
    alt={alt}
    className="w-20 h-20 rounded-full border border-gray-300 shadow-sm"
  />
)

type Tab = 'editarPerfil' | 'metodosLogin' | 'cambiarContrasena'

export default function EditProfilePanel() {
  const [activeTab, setActiveTab] = useState<Tab>('editarPerfil')
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('servineo_token')
      setToken(t)
    }
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600 text-lg">Cargando usuario...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <p className="text-red-600 text-lg">
          No hay usuario autenticado. Por favor inicia sesión.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Ir a Login
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#E8F1F9] to-[#F5FAFE] flex">
      <div className="w-72 bg-white shadow-xl border-r border-[#E0EAF3] flex flex-col items-center py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 self-start ml-6 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver al inicio</span>
        </button>

        <MockAvatar src={user.picture ?? undefined} alt={user.name || 'Usuario'} />
        <p className="mt-3 font-semibold text-gray-700 text-center text-lg">
          {user.name || user.email}
        </p>

        <div className="mt-8 flex flex-col w-full px-6 gap-2">
          {[
            { key: 'editarPerfil', label: 'Editar Perfil' },
            { key: 'metodosLogin', label: 'Métodos de Inicio de Sesión' },
            { key: 'cambiarContrasena', label: 'Cambiar Contraseña' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as Tab)}
              className={`py-2 rounded-xl w-full text-left px-4 font-medium transition-all ${
                activeTab === key
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-[#E0EAF3] h-full">
          {activeTab === 'editarPerfil' && (
            <>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Editar Perfil</h2>
              <RequesterEditForm />
            </>
          )}

          {activeTab === 'metodosLogin' && (
            <>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Métodos de Inicio de Sesión
              </h2>
              {token ? (
                <AccountLoginSettings token={token} />
              ) : (
                <p className="text-red-500">No se encontró token de usuario.</p>
              )}
            </>
          )}

          {activeTab === 'cambiarContrasena' && (
            <>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Cambiar Contraseña</h2>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-600">
                Aquí puedes implementar un formulario para cambiar la contraseña.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

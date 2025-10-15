'use client'

import { ReactNode, useState } from 'react'
import { User, Settings, X } from 'lucide-react'
/**
 * Ajusta esta importación a la ruta real de tu componente.
 * Posibles ejemplos (elige el correcto según tu estructura):
 *  - '../controlC/RequesterEditForm'
 *  - '../controlC/components/RequesterEditForm'
 *  - './components/RequesterEditForm'
 */
import RequesterEditForm from '../components/RequesterEditForm'

export default function Layout({ children }: { children: ReactNode }) {
  const [showForm, setShowForm] = useState(false)
  const requesterId = 'abc12' // simulación; cámbialo si tienes otro valor

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar global */}
      <header className="flex justify-between items-center p-4 shadow bg-white/80 backdrop-blur-sm sticky top-0 z-30">
  {/* Izquierda: Nombre del sistema */}
<div className=" text-2xl font-semibold text-dark-blue-900 tracking-wide ml-6">

    Servineo
  </div>

  {/* Derecha: Configuración y usuario */}
  <div className="flex items-center gap-4">
    {/* Botón de configuración */}
    <button
      title="Editar perfil"
      onClick={() => setShowForm(true)}
      className="p-2 rounded-md hover:bg-gray-100 transition"
    >
      <Settings size={22} className="text-gray-600" />
    </button>

    {/* Perfil del usuario */}
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-gray-100 w-9 h-9 flex items-center justify-center">
        <User size={18} className="text-gray-600" />
      </div>
      <div className="hidden sm:block text-right">
        <div className="text-sm font-medium text-gray-700">Miguel Maradona</div>
        <div className="text-xs text-gray-500">maradonamiguel4@gmail.com</div>
      </div>
    </div>
  </div>
</header>


      {/* Contenido principal */}
      <main className="p-5 max-w-4xl mx-auto">{children}</main>

      {/* Footer opcional */}
      <footer className="text-center p-4 text-gray-400 text-sm">
         &copy; {new Date().getFullYear()}
      </footer>

      {/* Modal sencillo para RequesterEditForm */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowForm(false)}
            aria-hidden
          />

          {/* modal box */}
          <div className="relative w-full max-w-3xl mx-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-lg font-medium">Editar perfil</div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4">
                {/* Importante: RequesterEditForm debe ser 'use client' */}
                <RequesterEditForm
                  requesterId={requesterId}
                  initialPhone="+591 7xxxxxxx"
                  initialLocation="Cochabamba"
                  onSaved={() => {
                    setShowForm(false)
                    // opcional: mostrar un toast o alert
                    alert('Cambios guardados!')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

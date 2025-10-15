'use client'

import { ReactNode, useState } from 'react'
import { User, Settings, X } from 'lucide-react'
import RequesterEditForm from '../components/RequesterEditForm'

export default function Layout({ children }: { children: ReactNode }) {
  const [showForm, setShowForm] = useState(false)
  const requesterId = 'abc12'

  return (
    <div className="min-h-screen bg-[#F5FAFE]">
      {/* navbar */}
      <header className="flex justify-between items-center p-4 shadow bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-[#E5F4FB]">
        {/* left: system name */}
        <div className="text-2xl font-bold tracking-wide ml-6" style={{ color: '#1A223F' }}>
          Servineo
        </div>

        {/* right: settings and user */}
        <div className="flex items-center gap-4">
          {/* settings button */}
          <button
            title="Editar perfil"
            onClick={() => setShowForm(true)}
            className="p-2 rounded-md hover:bg-[#E5F4FB] transition cursor-pointer"
          >
            <Settings size={22} className="text-[#1AA7ED]" />
          </button>

          {/* user profile */}
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#E5F4FB] w-9 h-9 flex items-center justify-center">
              <User size={18} className="text-[#2B6AE0]" />
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold" style={{ color: '#1A223F' }}>Miguel Maradona</div>
              <div className="text-xs text-[#759AE0]">maradonamiguel4@gmail.com</div>
            </div>
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="p-5 max-w-4xl mx-auto">{children}</main>

      {/* footer */}
      <footer className="text-center p-4 text-[#759AE0] text-sm border-t border-[#E5F4FB]">
        &copy; {new Date().getFullYear()}
      </footer>

      {/* modal for RequesterEditForm */}
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E5F4FB]">
              <div className="flex items-center justify-between p-4 border-b border-[#E5F4FB] bg-[#F5FAFE]">
                <div className="text-lg font-semibold" style={{ color: '#1A223F' }}>Editar perfil</div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded hover:bg-[#E5F4FB]"
                  title="Cerrar"
                >
                  <X size={18} className="text-[#2B6AE0]" />
                </button>
              </div>

              <div className="p-4">
                <RequesterEditForm
                  requesterId={requesterId}
                  initialPhone="+591 7xxxxxxx"
                  initialLocation="Cochabamba"
                  onSaved={() => {
                    setShowForm(false)
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
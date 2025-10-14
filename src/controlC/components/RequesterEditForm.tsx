'use client'

import { useState } from 'react'
import { Eye, EyeOff, Pencil } from 'lucide-react'

type Props = {
  requesterId: string
  initialPhone?: string
  initialLocation?: string
  onSaved?: () => void
}

export default function RequesterEditForm({
  requesterId,
  initialPhone = '',
  initialLocation = '',
  onSaved,
}: Props) {
  const [phone, setPhone] = useState(initialPhone)
  const [location, setLocation] = useState(initialLocation)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPhone, setShowPhone] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/requester', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requesterId, phone, location }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Error al guardar')
      }

      setLoading(false)
      setIsEditingPhone(false)
      setIsEditingLocation(false)
      onSaved?.()
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Error desconocido')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-white shadow-md rounded-2xl "
    >
      {/* Telefono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <div className="flex items-center gap-2">
          <input
            type={showPhone ? 'text' : 'password'}
            value={phone}
            disabled={!isEditingPhone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+591 7xxxxxxx"
            className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isEditingPhone ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPhone((prev) => !prev)}
            className="p-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100"
            title={showPhone ? 'Ocultar' : 'Mostrar'}
          >
            {showPhone ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setIsEditingPhone((prev) => !prev)}
            className={`p-2 rounded-md border ${
              isEditingPhone
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            title={isEditingPhone ? 'Bloquear campo' : 'Editar teléfono'}
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* Ubicaciion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
        <div className="flex items-center gap-2">
          <input
            value={location}
            disabled={!isEditingLocation}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ciudad, Dirección"
            className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isEditingLocation ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
          <button
            type="button"
            onClick={() => setIsEditingLocation((prev) => !prev)}
            className={`p-2 rounded-md border ${
              isEditingLocation
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            title={isEditingLocation ? 'Bloquear campo' : 'Editar ubicación'}
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mapa</label>
        <div className="w-full h-64 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-center bg-contain opacity-20" />
          <span className="relative z-10">🗺️ Mapa (en construcción)</span>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Botón guardar */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

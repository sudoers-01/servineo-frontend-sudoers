'use client'

import { useState } from 'react'
import { Eye, EyeOff, Pencil, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  requesterId: string
  initialPhone?: string
  initialLocation?: string
  onSaved?: () => void
  onCancel?: () => void
}

export default function RequesterEditForm({
  requesterId,
  initialPhone = '',
  initialLocation = '',
  onSaved,
  onCancel,
}: Props) {
  const router = useRouter()
  const [phone, setPhone] = useState(initialPhone)
  const [location, setLocation] = useState(initialLocation)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPhone, setShowPhone] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return // evita doble envío
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/requester', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requesterId, phone, location }),
      })

      if (!res.ok) {
        // intentar parsear JSON; si no viene JSON, fallback a mensaje genérico
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || `Error ${res.status}`)
      }

      setLoading(false)
      setIsEditingPhone(false)
      setIsEditingLocation(false)
      onSaved?.()
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'Error desconocido')
    }
  }

  function handleCancel() {
    // si el padre proporciona onCancel, lo usamos (ideal para cerrar modal).
    if (onCancel) {
      onCancel()
      return
    }
    // fallback original: navegar a /home/profile
    router.push('/home/profile')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-6"
      aria-busy={loading}
    >
      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <div className="flex items-center gap-2">
          <input
            id="phone"
            name="phone"
            inputMode="tel"
            type={showPhone ? 'text' : 'password'}
            value={phone}
            disabled={!isEditingPhone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+591 7xxxxxxx"
            autoComplete="tel"
            aria-label="Teléfono"
            className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isEditingPhone ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPhone((prev) => !prev)}
            className="p-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100"
            title={showPhone ? 'Ocultar' : 'Mostrar'}
            aria-pressed={showPhone}
          >
            {showPhone ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setIsEditingPhone((prev) => !prev)}
            className={`p-2 rounded-md border ${
              isEditingPhone ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            title={isEditingPhone ? 'Bloquear campo' : 'Editar teléfono'}
            aria-pressed={isEditingPhone}
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación
        </label>
        <div className="flex items-center gap-2">
          <input
            id="location"
            name="location"
            inputMode="text"
            value={location}
            disabled={!isEditingLocation}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ciudad, Dirección"
            autoComplete="street-address"
            aria-label="Ubicación"
            className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isEditingLocation ? 'bg-white border-gray-300' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
          <button
            type="button"
            onClick={() => setIsEditingLocation((prev) => !prev)}
            className={`p-2 rounded-md border ${
              isEditingLocation ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            title={isEditingLocation ? 'Bloquear campo' : 'Editar ubicación'}
            aria-pressed={isEditingLocation}
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* Mapa (placeholder) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mapa</label>
        <div className="w-full h-64 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-center bg-contain opacity-20" />
          <span className="relative z-10">🗺️ Mapa (en construcción)</span>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      {/* Botones */}
      <div className="pt-4 space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="w-full rounded-md bg-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

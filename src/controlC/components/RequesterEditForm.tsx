'use client'

import { useState } from 'react'

type Props = {
  requesterId: string
  initialPhone?: string
  initialLocation?: string
  onSaved?: () => void
}

export default function RequesterEditForm({ requesterId, initialPhone = '', initialLocation = '', onSaved }: Props) {
  const [phone, setPhone] = useState(initialPhone)
  const [location, setLocation] = useState(initialLocation)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/requester', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requesterId, phone, location })
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Error al guardar')
      }

      setLoading(false)
      onSaved?.()
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Error desconocido')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {/* telefono*/}
      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+591 7xxxxxxx"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/*ubicacion */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Ubicación</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ciudad, Dirección"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* MAPA ESPACIO RESERVADO */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mapa</label>
        <div className="w-full h-48 border border-gray-300 rounded-md flex items-center justify-center text-gray-500 bg-gray-50">
          <span>mapita (en construccion)</span>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {}
      <div>
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

'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Pencil, Loader2, Crosshair } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// dynamic import for react-leaflet components to avoid ssr issues
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })

type Props = {
  requesterId: string
  initialPhone?: string
  initialLocation?: string
  onSaved?: () => void
  onCancel?: () => void
}

type LatLng = { lat: number; lng: number }

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
  const [latLng, setLatLng] = useState<LatLng | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // load leaflet css only on client
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     import('leaflet/dist/leaflet.css')
  //   }
  // }, [])

  // get address from coordinates using nominatim
  async function fetchAddress(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      )
      const data = await res.json()
      const { country, state, city, town, village, suburb } = data.address || {}
      const locationString = [
        country,
        state,
        city || town || village,
        suburb,
      ]
        .filter(Boolean)
        .join(', ')
      setLocation(locationString || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } catch {
      setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }

  // get user current location and update address
  function handleGetLocation() {
    if (!navigator.geolocation) {
      setError('geolocation is not supported in this browser')
      return
    }
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLatLng(coords)
        fetchAddress(coords.lat, coords.lng)
      },
      () => setError('could not get current location'),
      { enableHighAccuracy: true }
    )
  }

  // allow user to pick a point on the map and update address
  function LocationMarker() {
    if (typeof window === 'undefined') return null
    const { useMapEvents } = require('react-leaflet')
    useMapEvents({
      click(e: any) {
        setLatLng(e.latlng)
        fetchAddress(e.latlng.lat, e.latlng.lng)
      },
    })
    return latLng ? (
      <Marker position={[latLng.lat, latLng.lng]} />
    ) : null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      ////////////////////aplicar .env.local////////////////////
      ///const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requester`, {
      //////////////////////////////////////////////////////////
      const res = await fetch('http://localhost:3000/api/requester', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requesterId, phone, location }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || `error ${res.status}`)
      }
      setLoading(false)
      setIsEditingPhone(false)
      setIsEditingLocation(false)
      onSaved?.()
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'unknown error')
    }
  }

  function handleCancel() {
    if (onCancel) {
      onCancel()
      return
    }
    router.push('/home/profile')
  }// ...existing imports...
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-white rounded-2xl p-8"
      aria-busy={loading}
    >
      {/* phone input */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold mb-1" style={{ color: '#1A223F' }}>
          numero de telefono:
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
            aria-label="telefono"
            className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1AA7ED] transition ${
              isEditingPhone
                ? 'bg-white border-[#759AE0]'
                : 'bg-[#F5FAFE] border-[#E5F4FB] cursor-not-allowed'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPhone((prev) => !prev)}
            className="p-2 rounded-md border border-[#E5F4FB] bg-[#F5FAFE] hover:bg-[#E5F4FB] transition"
            title={showPhone ? 'ocultar' : 'mostrar'}
            aria-pressed={showPhone}
          >
            {showPhone ? <EyeOff size={18} color="#1A223F" /> : <Eye size={18} color="#1A223F" />}
          </button>
          <button
            type="button"
            onClick={() => setIsEditingPhone((prev) => !prev)}
            className={`p-2 rounded-md border transition ${
              isEditingPhone
                ? 'border-[#1A223F] bg-[#E5F4FB] text-[#1A223F]'
                : 'border-[#E5F4FB] bg-[#F5FAFE] hover:bg-[#E5F4FB] text-[#1A223F]'
            }`}
            title={isEditingPhone ? 'bloquear campo' : 'editar telefono'}
            aria-pressed={isEditingPhone}
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* location input */}
      <div>
        <label htmlFor="location" className="block text-sm font-semibold mb-1" style={{ color: '#1A223F' }}>
          ubicacion
        </label>
        <div className="flex items-center gap-2">
          <input
            id="location"
            name="location"
            inputMode="text"
            value={location}
            disabled
            placeholder="pais, ciudad, departamento"
            autoComplete="street-address"
            aria-label="ubicacion"
            className="flex-1 rounded-md border px-3 py-2 bg-[#F5FAFE] border-[#E5F4FB] cursor-not-allowed text-[#1A223F]"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="p-2 rounded-md border border-[#E5F4FB] bg-[#F5FAFE] hover:bg-[#2BDDE0]/20 transition"
            title="usar mi ubicacion actual"
          >
            <Crosshair size={18} color="#2BDDE0" />
          </button>
        </div>
        <span className="text-xs" style={{ color: '#759AE0' }}>haz click en el boton gps o en el mapa para seleccionar tu ubicacion</span>
      </div>

      {/* map section */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: '#1A223F' }}>mapa</label>
        <div className="w-full h-64 border border-[#E5F4FB] rounded-lg overflow-hidden bg-gradient-to-br from-[#F5FAFE] to-[#E5F4FB] flex items-center justify-center text-gray-500 relative">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={latLng ? [latLng.lat, latLng.lng] : [-16.5, -68.15]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              whenReady={() => setMapReady(true)}
            >
              <TileLayer
                attribution='&copy; openstreetmap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapReady && <LocationMarker />}
            </MapContainer>
          )}
          {!mapReady && (
            <span className="absolute inset-0 flex items-center justify-center z-10" style={{ color: '#1A223F' }}>mapa cargando...</span>
          )}
        </div>
      </div>

      {/* error message */}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      {/* action buttons */}
      <div className="pt-4 flex flex-row gap-3 justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-md bg-[#1A223F] px-3 py-1.5 text-white text-sm font-semibold hover:bg-[#2B31E0] disabled:bg-[#759AE0] transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> guardando...
            </>
          ) : (
            'guardar'
          )}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md bg-[#E5F4FB] px-3 py-1.5 text-[#1A223F] text-sm font-semibold hover:bg-[#2BDDE0]/20 transition cursor-pointer"
        >
          cancelar
        </button>
      </div>
    </form>
  )
}
'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Pencil, Loader2, Crosshair } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  obtenerDatosUsuarioLogueado,
  actualizarDatosUsuario,
} from './service/api';



// Lazy load Leaflet (evita errores SSR)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

type LatLng = { lat: number; lng: number };

export default function RequesterEditForm() {
  const router = useRouter();
  const [telefono, setTelefono] = useState('');
  const [direction, setDirection] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null);
  const [showTelefono, setShowTelefono] = useState(false);
  const [isEditingTelefono, setIsEditingTelefono] = useState(false);
  const [latLng, setLatLng] = useState<LatLng | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [ubicacion, setUbicacion] = useState({
          lat: 0,
          lng: 0,
          direccion: '',
          departamento: '',
          pais: '',
        });



  // ✅ Cargar datos del usuario al montar
  useEffect(() => {
  async function cargarDatos() {
    try {
      const userData = await obtenerDatosUsuarioLogueado();
      setTelefono(userData.telefono || '');
      setUbicacion(userData.ubicacion || {
        lat: 0,
        lng: 0,
        direccion: '',
        departamento: '',
        pais: '',
      });

      // 👇 nuevo: actualiza el mapa según la ubicación guardada
      if (userData.ubicacion && userData.ubicacion.lat && userData.ubicacion.lng) {
        setLatLng({
          lat: userData.ubicacion.lat,
          lng: userData.ubicacion.lng,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tus datos.');
    }
  }
  cargarDatos();
}, []);



  // 🔹 Función de validación del número
  function validarTelefono(valor: string) {
    if (valor.length < 8 || valor.length > 15) return false;
    if (valor.startsWith('+')) return /^[+][0-9]{7,14}$/.test(valor);
    return /^[0-9]{8,15}$/.test(valor);
  }

  function handleTelefonoChange(e: React.ChangeEvent<HTMLInputElement>) {
    let valor = e.target.value;
    if (valor.startsWith('+')) valor = '+' + valor.slice(1).replace(/[^0-9]/g, '');
    else valor = valor.replace(/[^0-9]/g, '');
    setTelefono(valor);
    // limpiar error especifico de telefono al modificar
    setErrorTelefono(null);
    // opcional limpiar error global
    setError(null);
  }

  async function fetchAddress(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    const { country, state, road, suburb, city, town } = data.address || {};

    setUbicacion({
      lat,
      lng,
      direccion: [road, suburb, city || town].filter(Boolean).join(', ') || '',
      departamento: state || '',
      pais: country || '',
    });
  } catch {
    setUbicacion((prev) => ({
      ...prev,
      lat,
      lng,
      direccion: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }));
  }
}


  function handleGetLocation() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLatLng(coords);
        fetchAddress(coords.lat, coords.lng);
      },
      () => setError('No se pudo obtener tu ubicación'),
      { enableHighAccuracy: true }
    );
  }

  function LocationMarker() {
  if (typeof window === 'undefined') return null;

  const { useMap, useMapEvents } = require('react-leaflet');
  const map = useMap();

  // 🔹 Mueve el marcador y centra el mapa al hacer clic
  useMapEvents({
    click(e: any) {
      setLatLng(e.latlng);
      fetchAddress(e.latlng.lat, e.latlng.lng);
      // centra suavemente el mapa donde se colocó el marcador
      map.flyTo(e.latlng, map.getZoom(), { animate: true });
    },
  });

  // 🔹 Centra automáticamente cuando cambia la ubicación (por GPS o base de datos)
  useEffect(() => {
    if (latLng) {
      map.flyTo([latLng.lat, latLng.lng], map.getZoom(), { animate: true });
    }
  }, [latLng]);

  return latLng ? <Marker position={[latLng.lat, latLng.lng]} /> : null;
}


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!validarTelefono(telefono)) {
      setError('Ingrese un número de teléfono válido');
      return;
    }

    setLoading(true);
    try {
          const result = await actualizarDatosUsuario({
            telefono,
            ubicacion,
      });


      // Si la API nos indica que el número ya está en uso, mostramos error junto al campo
      if (!result.success) {
        if (result.code === "PHONE_TAKEN") {
          setErrorTelefono("Este número ya está registrado"); //error 409
          setError(null); // limpiar error global
          setLoading(false);
          return;
        }
        // comportamiento previo para otros errores
        throw new Error(result.message);
      }

      alert('✅ Perfil actualizado correctamente');
      setIsEditingTelefono(false);

    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker-icon-2x.png',
        iconUrl: '/marker-icon.png',
        shadowUrl: '/marker-shadow.png',
      });
    }
  }, []);
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-white rounded-2xl p-8"
      aria-busy={loading}
    >
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: '#1A223F' }}>
          Número de teléfono:
        </label>
        <div className="flex items-center gap-2">
          <input
            type={showTelefono ? 'text' : 'password'}
            value={telefono}
            disabled={!isEditingTelefono}
            onChange={handleTelefonoChange}
            placeholder="+591 7xxxxxxx"
            autoComplete="tel"
            className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 transition ${
              isEditingTelefono
                ? 'bg-white border-[#759AE0] focus:ring-[#1AA7ED]'
                : 'bg-[#F5FAFE] border-[#E5F4FB] cursor-not-allowed'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowTelefono((p) => !p)}
            className="p-2 rounded-md border border-[#E5F4FB] bg-[#F5FAFE] hover:bg-[#E5F4FB] transition"
          >
            {showTelefono ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            type="button"
            onClick={() => { setIsEditingTelefono((p) => !p); setErrorTelefono(null); }}
            className={`p-2 rounded-md border transition ${
              isEditingTelefono
                ? 'border-[#1A223F] bg-[#E5F4FB]'
                : 'border-[#E5F4FB] bg-[#F5FAFE] hover:bg-[#E5F4FB]'
            }`}
          >
            <Pencil size={18} />
          </button>
        </div>
        {errorTelefono && <p className="text-sm text-red-600 mt-1" role="alert">{errorTelefono}</p>}

      </div>

      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: '#1A223F' }}>
          Ubicación:
        </label>
        <div className="flex items-center gap-2">
          <input
            value={ubicacion.direccion || ''}
            disabled
            placeholder="País, ciudad, departamento"
            className="flex-1 rounded-md border px-3 py-2 bg-[#F5FAFE] border-[#E5F4FB] cursor-not-allowed"
          />

          <button
            type="button"
            onClick={handleGetLocation}
            className="p-2 rounded-md border border-[#E5F4FB] bg-[#F5FAFE] hover:bg-[#2BDDE0]/20 transition"
          >
            <Crosshair size={18} color="#2BDDE0" />
          </button>
        </div>
        <span className="text-xs" style={{ color: '#759AE0' }}>
          Haz clic en el botón GPS o en el mapa para seleccionar tu ubicación
        </span>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: '#1A223F' }}>
          Mapa
        </label>
        <div className="w-full h-64 border border-[#E5F4FB] rounded-lg overflow-hidden bg-gradient-to-br from-[#F5FAFE] to-[#E5F4FB] flex items-center justify-center relative">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={latLng ? [latLng.lat, latLng.lng] : [-16.5, -68.15]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              whenReady={() => setMapReady(true)}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapReady && <LocationMarker />}
            </MapContainer>
          )}
          {!mapReady && (
            <span className="absolute inset-0 flex items-center justify-center text-gray-600">
              Cargando mapa...
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-[#1A223F] px-4 py-2 text-white font-semibold hover:bg-[#2B31E0] disabled:bg-[#759AE0]"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Guardar'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-[#E5F4FB] px-4 py-2 text-[#1A223F] font-semibold hover:bg-[#2BDDE0]/20"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

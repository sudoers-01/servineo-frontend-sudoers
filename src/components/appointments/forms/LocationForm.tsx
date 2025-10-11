// components/appointments/forms/LocationForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";

export type LocationData = {
  modality: "virtual" | "presencial";
  place?: string;
  meetingLink?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

export type LocationFormHandle = {
  open: (initialData: LocationData) => void;
  close: () => void;
};

interface LocationFormProps {
  onLocationSelected: (locationData: LocationData) => void;
  onBack: () => void;
}

const LocationForm = forwardRef<LocationFormHandle, LocationFormProps>(({ onLocationSelected, onBack }, ref) => {
  const [open, setOpen] = useState(false);
  const [modality, setModality] = useState<"virtual" | "presencial">("virtual");
  const [place, setPlace] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Ubicaciones predefinidas para demostración
  const predefinedLocations = [
    { id: "fcyt", name: "Campus FCyT - Aula 12", coordinates: { lat: -17.7833, lng: -63.1821 } },
    { id: "central", name: "Oficina Central - Piso 3", coordinates: { lat: -17.7840, lng: -63.1815 } },
    { id: "lab1", name: "Laboratorio de Computación", coordinates: { lat: -17.7828, lng: -63.1818 } },
    { id: "sala", name: "Sala de Conferencias", coordinates: { lat: -17.7835, lng: -63.1825 } }
  ];

  useImperativeHandle(ref, () => ({
    open: (initialData: LocationData) => {
      setModality(initialData.modality);
      setPlace(initialData.place || "");
      setMeetingLink(initialData.meetingLink || "");
      setSelectedLocation("");
      setOpen(true);
    },
    close: () => handleClose()
  }), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleClose() {
    setOpen(false);
  }

  function handleLocationSelect(locationId: string) {
    const location = predefinedLocations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(locationId);
      setPlace(location.name);
    }
  }

  function handleSubmit() {
    const locationData: LocationData = {
      modality,
      ...(modality === "presencial" ? { 
        place: place.trim(),
        coordinates: predefinedLocations.find(loc => loc.id === selectedLocation)?.coordinates
      } : {
        meetingLink: meetingLink.trim() || `https://meet.example.com/${Math.random().toString(36).slice(2, 9)}`
      })
    };

    onLocationSelected(locationData);
    handleClose();
  }

  function handleCustomLocation() {
    setSelectedLocation("custom");
    setPlace("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-auto" style={{ maxHeight: "90vh" }}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-black">Seleccionar Ubicación</h3>
              <p className="text-sm text-gray-600 mt-1">Paso 2 de 2 - Define dónde será la cita</p>
            </div>
            <button aria-label="Cerrar" className="text-gray-500 hover:text-gray-700" onClick={handleClose}>✕</button>
          </div>

          <div className="space-y-6">
            {/* Contenido dinámico según modalidad */}
            {modality === "presencial" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selecciona una ubicación
                  </label>
                  
                  {/* Ubicaciones predefinidas */}
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {predefinedLocations.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => handleLocationSelect(location.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedLocation === location.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="font-medium text-gray-800">{location.name}</div>
                        <div className="text-sm text-gray-600 mt-1">📍 {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</div>
                      </button>
                    ))}
                  </div>

                  {/* Ubicación personalizada */}
                  <button
                    type="button"
                    onClick={handleCustomLocation}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedLocation === "custom"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium text-gray-800">📍 Ingresar ubicación personalizada</div>
                  </button>

                  {/* Campo para ubicación personalizada */}
                  {(selectedLocation === "custom" || (!selectedLocation && place)) && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección específica
                      </label>
                      <input
                        type="text"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        placeholder="Ej: Av. Ejemplo #123, Entre calles..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Enlace de reunión
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.example.com/tu-reunion"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600">
                  Si no ingresas un enlace, se generará uno automáticamente.
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onBack}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Volver
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={modality === "presencial" && !place.trim()}
                className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirmar Cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LocationForm;
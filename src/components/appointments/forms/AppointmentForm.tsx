// components/appointments/forms/AppointmentForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import LocationModal from "./LocationModal"; // Cambiar la importación
import AppointmentSummaryModal from "./AppointmentSummaryModal";

export type AppointmentFormHandle = {
  open: (datetimeISO: string, meta?: { eventId?: string; title?: string }) => void;
  close: () => void;
};

interface AppointmentFormProps {
  onNextStep?: (appointmentData: any) => void;
}


const AppointmentForm = forwardRef<AppointmentFormHandle, AppointmentFormProps>(({ onNextStep }, ref) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [datetime, setDatetime] = useState<string>("");
  const [client, setClient] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [modality, setModality] = useState<"virtual" | "presencial">("virtual");
  const [description, setDescription] = useState<string>("");
  const [place, setPlace] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ eventId?: string; title?: string } | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
  name: string;
  date: string;
  time: string;
  modality: "virtual" | "presencial";
  locationOrLink: string;
  description?: string;} | null>(null);


  useImperativeHandle(ref, () => ({
    open: (dt: string, m?: { eventId?: string; title?: string }) => {
      setDatetime(dt);
      setMeta(m || null);
      setOpen(true);
      setTimeout(() => firstFieldRef.current?.focus(), 40);
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
    setClient("");
    setContact("");
    setModality("virtual");
    setDescription("");
    setPlace("");
    setLocation(null);
    setMsg(null);
    setMeetingLink("");
  }

  function parseDatetime(datetimeISO: string) {
  const start = new Date(datetimeISO);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hora

  return {
    selected_date: start.toISOString().split("T")[0], // solo la fecha
    starting_time: start.toISOString(),
    finishing_time: end.toISOString()
  };
  }


  // Función para manejar la confirmación de ubicación
  const handleLocationConfirm = (locationData: { lat: number; lon: number; address: string }) => {
    setLocation(locationData);
    setPlace(locationData.address);
    setShowLocationModal(false);
  };


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!client.trim()) return setMsg("Ingrese el nombre del cliente.");
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nameRegex.test(client.trim())) return setMsg("Ingrese un nombre válido.");

    if (!contact.trim()) return setMsg("Ingrese un numero de contacto.");
    const phoneRegex = /^[67]\d{7}$/;
    if (!phoneRegex.test(contact.trim())) return setMsg("Ingrese un teléfono válido.");

    if (!description.trim()) return setMsg("Ingrese una descripción."); 
    const descRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.]+$/;
    if (!descRegex.test(description.trim())) return setMsg("Ingrese una descripción válida.");
    

    const { selected_date, starting_time, finishing_time } = parseDatetime(datetime); //nuevo

    const payload: any = {
      id_fixer: "fixer123", // ← reemplaza con valor dinámico 
      id_requester: "requester456", // ← reemplaza con valor dinámico 
      selected_date,
      starting_time,
      finishing_time,
      current_requester_name: client.trim(),
      current_requester_phone: contact.trim(),
      appointment_type: modality,
      appointment_description: description.trim()
    };

    // Si es presencial y tenemos ubicación, agregar datos de ubicación
    if (modality === "presencial") {
      if (!place) return setMsg("Selecciona una ubicación.");
      payload.place_id = location?.address || place;
    } 
    if (modality === "virtual") {
      if (!meetingLink.trim()) return setMsg("Ingrese un enlace de reunión.");
      const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/i;
      if (!urlRegex.test(meetingLink.trim())) return setMsg("Ingrese un enlace válido.");
    }

    await submitAppointment(payload);
  }

  async function submitAppointment(payload: any) {
    setLoading(true);
    try {
      const res = await fetch("https://servineo-back.vercel.app/api/bookings", { //usar ruta real con back
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || data?.message || "Error al guardar");
        setLoading(false);
        return;
      }

      const bookingId = data?.id || data?.insertedId || String(Date.now());
      window.dispatchEvent(new CustomEvent("booking:created", {
        detail: {
          datetime: payload.starting_time,
          id: bookingId,
          meta: payload
        }
      }));

      setMsg("¡Cita creada!");
      setTimeout(() => {
        setLoading(false);
        handleClose();
      }, 700);
      setSummaryData({
        name: client.trim(),
        date: new Date(payload.starting_time).toLocaleDateString(),
        time: new Date(payload.starting_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modality: payload.appointment_type,
        locationOrLink: payload.appointment_type === "virtual" ? payload.link_id : payload.place_id,
        description: payload.appointment_description
      });

      setShowSummary(true);

    } catch (err: any) {
      console.error(err);
      setMsg("Error en la conexión.");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="appointment-title"
          className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto overflow-auto"
          style={{ maxHeight: "90vh" }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <h3 id="appointment-title" className="text-lg font-semibold text-black">
                Agendar cita {meta?.title ? `- ${meta.title}` : ""}
              </h3>
              <button
                aria-label="Cerrar"
                className="text-gray-500 hover:text-gray-700"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded">
                <label className="block">
                  <span className="text-sm font-medium">Fecha y hora</span>
                  <input
                    readOnly
                    value={new Date(datetime).toLocaleString()}
                    className="mt-1 block w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Modalidad</span>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as "virtual" | "presencial")}
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="virtual">Virtual</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium">Cliente</span>
                  <input
                    ref={firstFieldRef}
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Contacto</span>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="77777777"
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Descripción del trabajo</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del trabajo requerido"
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                  rows={3}
                />
              </label>

              {modality === "presencial" ? (
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => setShowLocationModal(true)}
                    className="text-center py-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      📍 {place ? "Editar ubicación" : "Seleccionar ubicación"}
                    </p>
                  </div>

                  {place && (
                    <p className="text-sm text-green-700 px-2">
                      📌 Ubicación: {place}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-sm font-medium">Enlace de reunión </span>
                    <input
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.example.com/"
                      className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                    />
                  </label>
                  <p className="text-xs text-black-600">
                    Ingrese un enlace para contactarse.
                  </p>
                </div>
              )}

              <LocationModal
                open={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onConfirm={handleLocationConfirm}
                initialCoords={location}
              />

              {msg && <p className="text-sm text-red-600">{msg}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded bg-gray-300 text-sm"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || (modality === "presencial" && !place)}
                  className="px-4 py-2 rounded bg-[#2B6AE0] text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Guardando..."
                    : onNextStep
                    ? modality === "presencial"
                      ? "Siguiente →"
                      : "Confirmar"
                    : "Añadir"}
                </button>

<button
  type="button"
  onClick={() => {
    setSummaryData({
      name: "Alejandro",
      date: "13/10/2025",
      time: "10:00",
      modality: "virtual",
      locationOrLink: "https://meet.example.com/test123",
      description: "Consulta técnica"
    });
    setShowSummary(true);
  }}
  className="px-4 py-2 bg-green-600 text-white rounded text-sm"
>
  Probar virtual
</button>
<button
  type="button"
  onClick={() => {
    setSummaryData({
      name: "Alejandro",      
      date: "13/10/2025",
      time: "08:30",
      modality: "presencial",
      locationOrLink: "Av. América y Melchor Pérez",
      description: "Instalación de equipo"
    });
    setShowSummary(true);
  }}
  className="px-4 py-2 bg-purple-600 text-white rounded text-sm"
>
  Probar presencial
</button>
               
              </div>
            </form>
          </div>
        </div>
      </div>
      <AppointmentSummaryModal
      open={showSummary}
      onClose={() => setShowSummary(false)}
      data={summaryData!} />
    </>
  );
  
});

export default AppointmentForm;
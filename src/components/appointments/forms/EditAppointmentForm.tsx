// components/appointments/forms/EditAppointmentForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import LocationModal from "./LocationModal";

export type AppointmentPayload = {
  datetime: string;
  client: string;
  contact: string;
  modality: "virtual" | "presential";
  description?: string;
  place?: string;
  meetingLink?: string;
  location?: { lat: number; lon: number; address: string };
};

export type ExistingAppointment = AppointmentPayload & {
  id: string;
};

export type EditAppointmentFormHandle = {
  open: (appointmentData: ExistingAppointment) => void;
  close: () => void;
};

function genMeetingLink(datetimeISO: string) {
  const id = Math.random().toString(36).slice(2, 9);
  return `https://meet.example.com/${id}?t=${encodeURIComponent(datetimeISO)}`;
}

const EditAppointmentForm = forwardRef<EditAppointmentFormHandle>((_props, ref) => {
  const [open, setOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [datetime, setDatetime] = useState<string>("");
  const [client, setClient] = useState<string>("");
  const [contact, setContact] = useState<string>("+591 ");
  const [modality, setModality] = useState<"virtual" | "presential">("virtual");
  const [description, setDescription] = useState<string>("");
  const [place, setPlace] = useState<string>(""); 
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string } | null>(null);
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  // Estado para guardar los datos originales
  const [originalAppointment, setOriginalAppointment] = useState<ExistingAppointment | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Validación de 24 horas
  const canEditAppointment = (appointmentDateTime: string): boolean => {
    const appointmentDate = new Date(appointmentDateTime);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 24;
  };

  useImperativeHandle(ref, () => ({
    open: (appointmentData: ExistingAppointment) => {
      setAppointmentId(appointmentData.id);
      setDatetime(appointmentData.datetime);
      setClient(appointmentData.client);
      setContact(appointmentData.contact);
      setModality(appointmentData.modality);
      console.log(appointmentData.modality)
      setDescription(appointmentData.description || "");
      setPlace(appointmentData.place || "");
      setLocation(appointmentData.location || null);
      setMeetingLink(appointmentData.meetingLink || "");
      setOriginalAppointment(appointmentData); // Guardar los datos originales
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
    setAppointmentId("");
    setClient("");
    setContact("+591 ");
    setModality("virtual");
    setDescription("");
    setPlace("");
    setLocation(null);
    setMeetingLink("");
    setMsg(null);
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

    if (!client.trim()) return setMsg("Ingresa el nombre del cliente.");
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nameRegex.test(client.trim())) return setMsg("Ingrese un nombre válido.");

    if (!contact.trim()) return setMsg("Ingresa un contacto válido.");
    const phoneRegex = /^[67]\d{7}$/;
    const phone = contact.replace(/\D/g, "").slice(-8);
    if (!phoneRegex.test(phone)) return setMsg("Teléfono debe iniciar con 6 o 7 y tener 8 dígitos.");

    if (!description.trim()) return setMsg("Ingrese una descripción.");
    const descRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.]+$/;
    if (!descRegex.test(description.trim())) return setMsg("Ingrese una descripción válida.");

    // Construir payload solo con campos modificados
  const payload: any = {};
  if (!originalAppointment) return setMsg("Error: datos originales no disponibles");

  if (client.trim() !== originalAppointment.client) {
    payload.current_requester_name = client.trim();
  }

  if (contact.trim() !== originalAppointment.contact) {
    payload.current_requester_phone = contact.trim();
  }

  if ((description || "") !== (originalAppointment.description || "")) {
    payload.appointment_description = description.trim();
  }

  if (modality !== originalAppointment.modality) {
    payload.appointment_type = modality === "presential" ? "presential" : "virtual";
  }

  if (modality === "presential") {
    if (!place) return setMsg("Selecciona una ubicación.");

    console.log('Location:', location);
    console.log('Original Location:', originalAppointment.location);
    
    const scheduleUpdates: any = {};
    
    if ((place || "") !== (originalAppointment.place || "")) {
      scheduleUpdates.display_name = place.trim();
    }
    if (location && JSON.stringify(location) !== JSON.stringify(originalAppointment.location)) {
      scheduleUpdates.lat = location.lat.toString();
      scheduleUpdates.lon = location.lon.toString();
    }
  } else {
    const linkToUse = meetingLink.trim() || genMeetingLink(datetime);
    
    if (meetingLink.trim()) {
      const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/i;
      if (!urlRegex.test(meetingLink.trim())) return setMsg("Ingrese un enlace válido.");
    }
    
    if ((meetingLink || "") !== (originalAppointment.meetingLink || "")) {
      payload.link_id = linkToUse;
    }
  }

if (Object.keys(payload).length === 0) {
  setMsg("No hay cambios para guardar.");
  return;
}
    setLoading(true);
    try {
      //https://servineo-backend-lorem.onrender.com/api/crud_update/appointments/update_by_id
      const API = process.env.NEXT_PUBLIC_BACKEND as string;
      console.log('Id de la cita',appointmentId);
      const res = await fetch(`${API}/api/crud_update/appointments/update_by_id?id=${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log('APPO to be sent',res)
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || data?.message || "Error al actualizar");
        setLoading(false);
        return;
      }

      setMsg("¡Cita actualizada!");
      setTimeout(() => { setLoading(false); handleClose(); }, 700);
    } catch (err: any) {
      console.error(err);
      setMsg("Error en la conexión.");
      setLoading(false);
    }
  }

  if (!open) return null;

  // Validación de 24 horas - muestra mensaje si no se puede editar
  if (!canEditAppointment(datetime)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">No se puede editar</h3>
          <p className="text-gray-700 mb-4">
            Las citas solo se pueden editar hasta 24 horas antes de la cita programada.
          </p>
          <div className="flex justify-end">
            <button 
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="edit-appointment-title"
          className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto overflow-auto" style={{ maxHeight: "90vh" }}>
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <h3 id="edit-appointment-title" className="text-lg font-semibold text-black">
                Editar cita
              </h3>
              <button aria-label="Cerrar" className="text-gray-500 hover:text-gray-700" onClick={handleClose}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded">
                <label className="block">
                  <span className="text-sm font-medium">Fecha y hora</span>
                  <input readOnly value={new Date(datetime).toLocaleString()} className="mt-1 block w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm" />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Modalidad</span>
                  <select value={modality} onChange={(e) => setModality(e.target.value as "virtual" | "presential")}
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm">
                    <option value="virtual">Virtual</option>
                    <option value="presential">Presencial</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium">Cliente *</span>
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
                  <span className="text-sm font-medium">Contacto *</span>
                  <input 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+591 77777777" 
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
                  placeholder="Breve descripción de lo que se requiere" 
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white" 
                  rows={3} 
                />
              </label>

              {modality === "presential" ? (
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
                    <span className="text-sm font-medium">Enlace de reunión</span>
                    <input 
                      value={meetingLink} 
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.example.com/abcd" 
                      className="mt-1 block w-full border rounded px-3 py-2 bg-white" 
                    />
                  </label>
                  <p className="text-xs text-gray-600">Si no ingresa enlace, se generará uno automáticamente.</p>
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
                <button type="button" onClick={handleClose} className="px-4 py-2 rounded bg-gray-300 text-sm">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={loading || (modality === "presential" && !place)} 
                  className="px-4 py-2 rounded bg-[#2B6AE0] text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
});

export default EditAppointmentForm;
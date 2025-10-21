// components/appointments/forms/EditAppointmentForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import LocationModal from "./LocationModal";
import { z } from "zod";
const phoneRegex = /^[67]\d{7}$/;
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const descRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s,.]{0,300}$/;
const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/i;
const appointmentSchema = z.object({
      client: z.string()
        .min(1, "Ingresa el nombre del cliente")
        .regex(nameRegex, "Ingrese un nombre válido"),
      
      contact: z.string()
        .min(1, "Ingresa un contacto válido")
        .refine((val) => {
          const phone = val.replace(/\D/g, "").slice(-8);
          return phoneRegex.test(phone);
        }, "Teléfono debe iniciar con 6 o 7 y tener 8 dígitos"),
      
      description: z.string()
        .min(1, "Ingrese una descripción")
        .regex(descRegex, "Ingrese una descripción válida"),
      
      modality: z.enum(["virtual", "presencial"]),
      
      meetingLink: z.string()
        .optional()
        .refine((val) => !val || urlRegex.test(val), "Ingrese un enlace válido"),
      
      place: z.string().optional()
    }).refine((data) => {
      if (data.modality === "presencial") {
        return !!data.place && data.place.trim().length > 0;
      }
      return true;
    }, {
      message: "Selecciona una ubicación",
      path: ["place"]
    });

export type AppointmentPayload = {
  datetime: string;
  client: string;
  contact: string;
  modality: "virtual" | "presencial";
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
  const [modality, setModality] = useState<"virtual" | "presencial">("virtual");
  const [description, setDescription] = useState<string>("");
  const [place, setPlace] = useState<string>(""); 
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string } | null>(null);
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  // Estado para guardar los datos originales
  const [originalAppointment, setOriginalAppointment] = useState<ExistingAppointment | null>(null);

  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [hour, setHour] = useState<number>(0);

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
      if(appointmentData.modality != "virtual"){
        if(appointmentData.modality != "presencial"){
        appointmentData.modality = "presencial"
      }
      }
      console.log(appointmentData.modality);
      setAppointmentId(appointmentData.id);
      setDatetime(appointmentData.datetime);
      setClient(appointmentData.client);
      setContact(appointmentData.contact);
      setModality(appointmentData.modality);
      setModality(appointmentData.modality);
      setDescription(appointmentData.description || "");
      setPlace(appointmentData.place || "");
      setLocation(appointmentData.location || null);
      setMeetingLink(appointmentData.meetingLink || "");
      setOriginalAppointment(appointmentData);

       const dateObj = new Date(appointmentData.datetime);
      setDay(dateObj.getDate().toString().padStart(2, '0'));
      setMonth((dateObj.getMonth() + 1).toString().padStart(2, '0'));
      setHour(dateObj.getHours())

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
    setDay("");
    setMonth("");
    setHour(0);
    setMsg(null);
  }

  // Función para manejar la confirmación de ubicación
  const handleLocationConfirm = (locationData: { lat: number; lon: number; address: string }) => {
    setLocation(locationData);
    setPlace(locationData.address);
    setShowLocationModal(false);
  };

  const incrementHour = () => {
    setHour(prev => (prev + 1) % 24);
  };

  const decrementHour = () => {
    setHour(prev => (prev - 1 + 24) % 24);
  };
  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, '0');

  const handleDayChange = (value: string) => {
  const numericValue = value.replace(/\D/g, '').slice(0, 2);
    setDay(numericValue);
  };

  const handleMonthChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 2);
    setMonth(numericValue);
  };
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!day || !month || day.length !== 2 || month.length !== 2) {
      setMsg("Ingrese día y mes válidos (DD/MM)");
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);

    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
      setMsg("Ingrese una fecha válida (DD: 1-31, MM: 1-12)");
      return;
    }
    const originalDate = new Date(originalAppointment?.datetime || datetime);
    const currentYear = originalDate.getFullYear();
    const newDatetime = new Date(currentYear, monthNum - 1, dayNum, hour, 0);
    if (newDatetime <= new Date()) {
      setMsg("La cita debe ser en una fecha y hora futura");
      return;
    }

    const formData = {
      client: client.trim(),
      contact: contact.trim(),
      description: description.trim(),
      modality,
      meetingLink: meetingLink.trim(),
      place: place.trim()
    };
    try {
      appointmentSchema.parse(formData);
    } catch (error) {
      setMsg("Error de validación");
      return;
    }

    // Construir payload solo con campos modificados
    const payload: any = {};
    if (!originalAppointment) return setMsg("Error: datos originales no disponibles");

    const originalDatetime = new Date(originalAppointment.datetime);
    if (newDatetime.getTime() !== originalDatetime.getTime()) {
      const datePart = newDatetime.toISOString().split('T')[0]; 
      payload.selected_date = datePart;
      payload.starting_time = newDatetime.toISOString();
    }

    if (client.trim() !== originalAppointment.client) {
      payload.current_requester_name = client.trim();
    }

    if (contact.trim() !== originalAppointment.contact) {
      payload.current_requester_phone = contact.trim();
    }

    if ((description || "") !== (originalAppointment.description || "")) {
      payload.appointment_description = description.trim();
    }

    //"selected_date": "2025-10-17",
   // "starting_time": "2025-10-17T14:00:00.000Z",


    if (modality !== originalAppointment.modality) {
      payload.appointment_type = modality === "presencial" ? "presential" : "virtual";
    }

    if (modality === "presencial") {
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
      console.log('Payload:',payload);
      console.log('Id de la cita',appointmentId);
      const res = await fetch(`${API}/api/crud_update/appointments/update_by_id?id=${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
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
              <div className="flex gap-4 p-3 rounded items-start">
                {/* FECHA - Ancho automático */}
                <div className="flex-none">
                  <label className="block">
                    <span className="text-sm font-medium">Fecha *</span>
                    <div className="flex items-center gap-1 mt-1">
                      <input 
                        type="text"
                        value={day}
                        onChange={(e) => handleDayChange(e.target.value)}
                        placeholder="DD"
                        className="w-10 h-10 border border-gray-300 rounded text-center font-mono text-sm"
                        maxLength={2}
                      />
                      <span className="text-gray-500 font-bold">/</span>
                      <input 
                        type="text"
                        value={month}
                        onChange={(e) => handleMonthChange(e.target.value)}
                        placeholder="MM"
                        className="w-10 h-10 border border-gray-300 rounded text-center font-mono text-sm"
                        maxLength={2}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">DD/MM</p>
                  </label>
                </div>

                {/* HORA - Ancho automático */}
                <div className="flex-none">
                  <label className="block">
                    <span className="text-sm font-medium">Hora *</span>
                    <div className="flex items-center gap-1 mt-1">
                      {/* Flecha izquierda (decrementar) */}
                      <button 
                        type="button"
                        onClick={decrementHour}
                        className="w-6 h-10 flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-100 bg-white text-xs"
                      >
                        ←
                      </button>
                      
                      {/* Número de la hora */}
                      <div className="w-10 h-10 flex items-center justify-center border-y border-gray-300 text-base font-mono bg-white">
                        {formatTimeUnit(hour)}
                      </div>

                      {/* Flecha derecha (incrementar) */}
                      <button 
                        type="button"
                        onClick={incrementHour}
                        className="w-6 h-10 flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-100 bg-white text-xs"
                      >
                        →
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hora entera</p>
                  </label>
                </div>

                {/* MODALIDAD - Ocupa el espacio restante */}
                <div className="flex-1">
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
                  disabled={loading || (modality === "presencial" && !place)} 
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
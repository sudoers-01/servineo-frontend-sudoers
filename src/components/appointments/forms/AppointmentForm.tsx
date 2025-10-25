// components/appointments/forms/AppointmentForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import LocationModal from "./LocationModal"; // Para seleccionar ubicación
import AppointmentSummaryModal from "./AppointmentSummaryModal"; // Para mostrar resumen

export type AppointmentFormHandle = {
  open: (datetimeISO: string, meta?: { eventId?: string; title?: string }) => void;
  close: () => void;
};

interface AppointmentFormProps {
  onNextStep?: (appointmentData: any) => void;
  fixerId: string;
  requesterId: string;
}
// Zod esquema de validacion
const baseSchema = z.object({
  client: z.string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Ingrese un nombre de cliente válido")
    .nonempty("Ingrese un nombre de cliente")
    .max(50, "El nombre no puede tener más de 50 caracteres"),

  contact: z.string()
    .regex(/^\+591 [67]\d{7}$/, "Ingrese un número de teléfono válido")
    .nonempty("Ingrese un número de teléfono"),

  description: z.string()
    .nonempty("Ingrese una descripción de trabajo")
    .max(300, "La descripción no puede tener más de 300 caracteres"),
});

// virtualSchema
const virtualSchema = baseSchema.extend({
  modality: z.literal("virtual"),
  meetingLink: z.string()
    .regex(/^(https?:\/\/)?(meet\.google\.com|zoom\.us)\/[^\s]+$/, "Ingrese un enlace válido de Meet o Zoom")
    .nonempty("Ingrese un enlace de Meet o Zoom"),
  location: z.undefined().optional(),
});

// presentialSchema
const presentialSchema = baseSchema.extend({
  modality: z.literal("presential"),
  meetingLink: z.undefined().optional(),
  location: z
    .object({
      lat: z.number(),
      lon: z.number(),
      address: z.string().nonempty("Seleccione una ubicación"),
    })
    .nullable()
    .refine(val => val !== null, { message: "Seleccione una ubicación" }), 
});

const appointmentSchema = z.discriminatedUnion("modality", [virtualSchema, presentialSchema]);

const AppointmentForm = forwardRef<AppointmentFormHandle, AppointmentFormProps>(({ onNextStep, fixerId, requesterId }, ref) => {
  const [open, setOpen] = useState(false);
  const [datetime, setDatetime] = useState<string>("");
  const [client, setClient] = useState<string>("");
  const [contact, setContact] = useState<string>("+591 ");
  const [modality, setModality] = useState<"virtual" | "presential">("virtual");
  const [description, setDescription] = useState<string>("");
  const [place, setPlace] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [meta, setMeta] = useState<{ eventId?: string; title?: string } | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    name: string;
    date: string;
    time: string;
    modality: "virtual" | "presential";
    locationOrLink: string;
    description?: string;
  } | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

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
    setContact("+591 ");
    setDescription("");
    setModality("virtual");
    setPlace("");
    setMeetingLink("");
    setLocation(null);
    setErrors({});
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Si el usuario intenta borrar el "+591 ", no permitirlo
    if (value.length < 5) {
      setContact("+591 ");
      return;
    }
    
    // Asegurarse de que siempre empiece con "+591 "
    if (!value.startsWith("+591 ")) {
      setContact("+591 " + value.replace(/[^\d]/g, '').slice(0, 8));
      return;
    }
    
    // Permitir solo números después del "+591 "
    const numbersOnly = value.slice(5).replace(/[^\d]/g, '');
    
    // Limitar a 8 dígitos después del "+591 "
    if (numbersOnly.length <= 8) {
      setContact("+591 " + numbersOnly);
    }
  };

  function parseDatetime(datetimeISO: string) {
    // Si el string ISO no termina en 'Z', agregarlo para forzar UTC
    const isoString = datetimeISO.endsWith('Z') ? datetimeISO : datetimeISO + 'Z';
    const prevStart = new Date(isoString);

    const currentYear = prevStart.getUTCFullYear();
    const currentMonth = prevStart.getUTCMonth();
    const currentDay = prevStart.getUTCDate();
    const currentHour = prevStart.getUTCHours();

    const start = new Date(Date.UTC(currentYear, currentMonth, currentDay, (currentHour - 4), 0, 0));

    const end = new Date(Date.UTC(currentYear, currentMonth, currentDay, (start.getUTCHours() + 1), 0, 0));

    //const startMinus4Hours = new Date(start.getTime() - 4 * 60 * 60 * 1000);

    //console.log("start: ", start.toISOString());
    //console.log("end: ", end.toISOString());
    return {
      selected_date: start.toISOString().split("T")[0],
      starting_time: start.toISOString(),
      finishing_time: end.toISOString()
    };
  }

  const handleLocationConfirm = (locationData: { lat: number; lon: number; address: string }) => {
    setLocation(locationData);
    setPlace(locationData.address);
    setShowLocationModal(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData = {
      client,
      contact,
      description,
      modality,
      meetingLink: modality === "virtual" ? meetingLink : undefined,
      location: modality === "presential" ? location : undefined,
    };

    const validation = appointmentSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(err => {
        if (Array.isArray(err.path) && err.path.length) {
          // Si el path es location.address, lo mostramos en errors.location
          const key = err.path[0];
          fieldErrors[key as string] = err.message;
        } else {
          fieldErrors['general'] = err.message;
        }
      });
      setErrors(fieldErrors);
      return; // no enviar si hay errores
    }

    const { selected_date, starting_time, finishing_time} = parseDatetime(datetime);

    const payload = {
      id_fixer: fixerId,
      id_requester: requesterId,
      selected_date,
      starting_time,
      finishing_time,
      schedule_state:"booked",
      appointment_type: modality,
      appointment_description: description,
      current_requester_name: client,
      current_requester_phone: contact,
      link_id: modality === "virtual" ? meetingLink : "",
      display_name_location: modality === "presential" ? place : "",
      lat: modality === "presential" ? location?.lat : null,
      lon: modality === "presential" ? location?.lon : null,
    };

    setLoading(true);
    try {
      const res = await axios.post("https://servineo-backend-lorem.onrender.com/api/crud_create/appointments/create", payload);
      const data = res.data;

      const hourToShow = new Date(payload.starting_time).getUTCHours();
      let hourToShowString;
      if(hourToShow < 10){
        hourToShowString = "0" + hourToShow.toString() + ":00";
      } else{
        hourToShowString = hourToShow.toString() + ":00";
      }

      if (data.success) {
        setSummaryData({
          name: client,
          date: new Date(payload.starting_time).toLocaleDateString(),
          time: hourToShowString,
          //time: new Date(payload.starting_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), para futuro
          modality,
          locationOrLink: modality === "virtual" ? meetingLink : place,
          description,
        });
        setShowSummary(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrors({ general: "Error: No se pudo crear la cita" });
    } finally {
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
              {/* Campos del formulario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded">
                <label className="block">
                  <span className="text-sm font-medium">Fecha y hora *</span>
                  <input
                    readOnly
                    value={new Date(datetime).toLocaleString()}
                    className="mt-1 block w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Modalidad *</span>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as "virtual" | "presential")}
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                  >
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
                  />
                  {errors.client && <p className="text-red-600 text-sm mt-1">{errors.client}</p>}
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Contacto *</span>
                  <input
                    value={contact}
                    onChange={handleContactChange}
                    placeholder="+591 7XXXXXXX"
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                  />
                  {errors.contact && <p className="text-red-600 text-sm mt-1">{errors.contact}</p>}
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Descripción del trabajo *</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del trabajo requerido"
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                  rows={3}
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </label>

              {modality === "presential" && (
                <>
                  <div
                    onClick={() => setShowLocationModal(true)}
                    className="text-center py-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      📍 {place ? "Editar ubicación" : "Seleccionar ubicación"}
                    </p>
                  </div>
                  {place && <p className="text-sm text-green-700 px-2 mt-1">📌 Ubicación: {place}</p>}
                  {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
                </>
              )}

              {modality === "virtual" && (
                <label className="block">
                  <span className="text-sm font-medium">Enlace de reunión *</span>
                  <input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.example.com/"
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                  />
                  {errors.meetingLink && <p className="text-red-600 text-sm mt-1">{errors.meetingLink}</p>}
                </label>
              )}

              {errors.general && <p className="text-red-600 text-sm mt-1">{errors.general}</p>}

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
                  disabled={loading}
                  className="px-4 py-2 rounded bg-[#2B6AE0] text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Añadir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LocationModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
        initialCoords={location}
      />

      {summaryData && (
        <AppointmentSummaryModal
          open={showSummary}
          onClose={() => {
            setShowSummary(false);
            handleClose();
          }}
          data={summaryData}
        />
      )}
    </>
  );
});

export default AppointmentForm;

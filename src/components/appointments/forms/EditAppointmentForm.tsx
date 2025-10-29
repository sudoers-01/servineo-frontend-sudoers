// components/appointments/forms/EditAppointmentForm.tsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import LocationModal from "./LocationModal";
import { set, z } from "zod";
import { parseUrl } from "next/dist/shared/lib/router/utils/parse-url";

// Import modules
import { EditAppointmentHeader } from './modules/EditAppointmentHeader';
import { DateTimeSection } from './modules/DateTimeSection';
import { ClientSection } from './modules/ClientSection';
import { DescriptionSection } from './modules/DescriptionSection';
import { LocationSection } from './modules/LocationSection';
import { MeetingLinkSection } from './modules/MeetingLinkSection';
import { EditAppointmentActions } from './modules/EditAppointmentActions';

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

export type AppointmentPayload = {
  datetime: string;
  client: string;
  contact: string;
  modality: "virtual" | "presencial";
  description?: string;
  meetingLink?: string;
  place?: string;
  lat?: number; 
  lon?: number; 
  address?: string;
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
  const [lat, setLat] = useState<number>();
  const [lon, setLon] = useState<number>();
  const [address, setAddress] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Estado para guardar los datos originales
  const [originalAppointment, setOriginalAppointment] = useState<ExistingAppointment | null>(null);

  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [hour, setHour] = useState<number>(0);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const [changesDetected, setChangesDetected] = useState<boolean>(false);

  // Detectar cambios cada vez que cambia algún campo
  useEffect(() => {
    if (!originalAppointment) {
      setChangesDetected(false);
      return;
    }

    const originalDate = new Date(originalAppointment.datetime);
    const originalDay = originalDate.getDate().toString().padStart(2, '0');
    const originalMonth = (originalDate.getMonth() + 1).toString().padStart(2, '0');
    const originalHour = originalDate.getHours();

    const hasDateTimeChanges = day !== originalDay || month !== originalMonth || hour !== originalHour;
    const hasClientChanges = client.trim() !== originalAppointment.client;
    const hasContactChanges = contact.trim() !== originalAppointment.contact;
    const hasDescriptionChanges = (description || "").trim() !== (originalAppointment.description || "").trim();
    const hasModalityChanges = modality !== originalAppointment.modality;

    let hasLocationOrLinkChanges = false;
    if (modality === "presencial") {
      hasLocationOrLinkChanges = (lat ?? 0) !== (originalAppointment.lat ?? 0) || 
                                  (lon ?? 0) !== (originalAppointment.lon ?? 0)|| 
                                  (address || "") !== (originalAppointment.address ||"");
    } else {
      hasLocationOrLinkChanges = (meetingLink||"").trim() !== (originalAppointment.meetingLink || "").trim();
    }

    const anyChange = hasDateTimeChanges || hasClientChanges || hasContactChanges || 
                      hasDescriptionChanges || hasModalityChanges || hasLocationOrLinkChanges;

    setChangesDetected(anyChange);
  }, [day, month, hour, client, contact, description, modality, lat, lon, address, meetingLink, originalAppointment]);

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
      setAppointmentId(appointmentData.id);
      setDatetime(appointmentData.datetime);
      setClient(appointmentData.client);
      // Si el contacto original no tiene +591, lo agregamos
      const formattedContact = appointmentData.contact.startsWith("+591") 
        ? appointmentData.contact 
        : "+591 " + appointmentData.contact;
      setContact(formattedContact);
      setModality(appointmentData.modality);
      setDescription(appointmentData.description || "");
      setLat(Number(appointmentData.lat));
      setLon(Number(appointmentData.lon));
      setAddress(appointmentData.address || "");
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
    setLat(0);
    setLon(0);
    setAddress("");
    setMeetingLink("");
    setDay("");
    setMonth("");
    setHour(0);
    setMsg(null);
    setErrors({});
  }

  const handleLocationConfirm = (locationData: { lat: number; lon: number; address: string }) => {
    setLat(locationData.lat);
    setLon(locationData.lon);
    setAddress(locationData.address);
    setShowLocationModal(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErrors({});
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

    const formData: any = {
      client: client.trim(),
      contact: contact.trim(),
      description: description.trim(),
      modality: modality === "presencial" ? "presential" : "virtual"
    };

    if (modality === "presencial") {
      formData.location = lat && lon && address ? {
        lat,
        lon,
        address: address.trim()
      } : null;
    } else {
      formData.meetingLink = meetingLink.trim() || genMeetingLink(datetime);
    }

    const validation = appointmentSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach(err => {
          if (Array.isArray(err.path) && err.path.length) {
            const key = err.path[0];
            fieldErrors[key as string] = err.message;
          } else {
            fieldErrors['general'] = err.message;
        }
        });
        setErrors(fieldErrors);
        return;
      }  
    
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
      payload.appointment_type = modality === "presencial" ? "presential" : "virtual";
    }

    if (modality === "presencial") {
      if (!address) return setMsg("Selecciona una ubicación.");
     
      const scheduleUpdates: any = {};
      
      if ((address || "") !== (originalAppointment.address || "")) {
        scheduleUpdates.display_name_location = address.trim();
      }
     const originalLat = originalAppointment.lat ?? null;
     const originalLon = originalAppointment.lon ?? null;
     console.log('Original Lat:',originalLat);
     console.log('Original Lon:',originalLon);
     console.log('New Lat:',lat);
     console.log('New Lon:',lon);  
     const originalAddress = originalAppointment.address ?? "";
    
      if (lat !== undefined && lat !== originalLat) {
        payload.lat = lat.toString();
      }
      
      if (lon !== undefined && lon !== originalLon) {
        payload.lon = lon.toString();
      }
      
      if (address !== originalAddress) {
        payload.display_name_location = address;
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
      const API = process.env.NEXT_PUBLIC_BACKEND as string;
      console.log('Datos Nuevos:',payload);
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
            <EditAppointmentHeader onClose={handleClose} />

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-black">
              <DateTimeSection 
                datetime={datetime}
                modality={modality}
                onModalityChange={setModality}
              />

              <ClientSection
                client={client}
                contact={contact}
                errors={errors}
                ref={firstFieldRef}  // ✅ Esto debería funcionar ahora
                onClientChange={setClient}
                onContactChange={setContact}
              />

              <DescriptionSection
                description={description}
                error={errors.description}
                onChange={setDescription}
              />

              {modality === "presencial" ? (
                <LocationSection
                  address={address}
                  error={errors.location}
                  onOpenLocationModal={() => setShowLocationModal(true)}
                />
              ) : (
                <MeetingLinkSection
                  meetingLink={meetingLink}
                  error={errors.meetingLink}
                  onChange={setMeetingLink}
                />
              )}

              <LocationModal
                open={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onConfirm={handleLocationConfirm}
                initialCoords={
                  lat !== undefined && lon !== undefined 
                    ? { 
                        lat: lat, 
                        lon: lon, 
                        address: address 
                      }
                    : undefined
                }
              />

              {msg && <p className="text-sm text-red-600">{msg}</p>}

              <EditAppointmentActions
                loading={loading}
                changesDetected={changesDetected}
                onCancel={handleClose}
                submitDisabled={modality === "presencial" && !address}
              />
            </form>
          </div>
        </div>
      </div>
    </>
  );
});

export default EditAppointmentForm;
"use client";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import axios from "axios";
import { z } from "zod";
import LocationModal from "./LocationModal";
import AppointmentSummaryModal from "./AppointmentSummaryModal";

export type RescheduleFormHandle = {
  open: (newSlotISO?: string) => void;
  close: () => void;
};

interface RescheduleFormProps {
  fixerId: string;
  requesterId: string;
  pastDate: string;   // ISO de la cita actual
  motivo: string;
  onSuccess?: () => void;
}

const baseSchema = z.object({
  client: z.string().regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Ingrese un nombre de cliente válido").nonempty("Ingrese un nombre de cliente").max(50),
  contact: z.string().regex(/^[67]\d{7}$/, "Ingrese un número de teléfono válido (8 dígitos)").nonempty("Ingrese un número de teléfono"),
  description: z.string().nonempty("Ingrese una descripción de trabajo").max(300),
});
const virtualSchema = baseSchema.extend({
  modality: z.literal("virtual"),
  meetingLink: z.string().regex(/^(https?:\/\/)?(meet\.google\.com|zoom\.us)\/[^\s]+$/, "Ingrese un enlace válido de Meet o Zoom").nonempty("Ingrese un enlace de Meet o Zoom"),
  location: z.undefined().optional(),
});
const presentialSchema = baseSchema.extend({
  modality: z.literal("presential"),
  meetingLink: z.undefined().optional(),
  location: z.object({ lat: z.number(), lon: z.number(), address: z.string().nonempty("Seleccione una ubicación") })
            .nullable()
            .refine((v) => v !== null, { message: "Seleccione una ubicación" }),
});
const appointmentSchema = z.discriminatedUnion("modality", [virtualSchema, presentialSchema]);

const API_BASE = process.env.NEXT_PUBLIC_BACKEND || "https://servineo-backend-lorem.onrender.com";

function ymd(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function startHour(iso: string) { return new Date(iso).getHours(); }

export default forwardRef<RescheduleFormHandle, RescheduleFormProps>(function RescheduleForm(
  { fixerId, requesterId, pastDate, motivo, onSuccess },
  ref
) {
  const [open, setOpen] = useState(false);
  const [newDatetime, setNewDatetime] = useState<string>("");

  // campos editables (prefill desde backend)
  const [client, setClient] = useState("");
  const [contact, setContact] = useState("");
  const [modality, setModality] = useState<"virtual" | "presential">("virtual");
  const [description, setDescription] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [place, setPlace] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    name: string; date: string; time: string;
    modality: "virtual" | "presential"; locationOrLink: string;
    description?: string; motive?: string;
  } | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    open: (iso?: string) => {
      if (iso) setNewDatetime(iso);
      setOpen(true);
      fetchExisting().finally(() => setTimeout(() => firstRef.current?.focus(), 40));
    },
    close: () => handleClose(),
  }));

  function handleClose() {
    setOpen(false);
    setNewDatetime("");
    setClient(""); setContact(""); setDescription("");
    setModality("virtual");
    setMeetingLink(""); setPlace(""); setLocation(null);
    setErrors({});
    setShowSummary(false); setSummaryData(null);
  }

  function parseNewTimes(iso: string) {
    const base = iso ? new Date(iso) : new Date();
    const start = new Date(base.getTime() - 4 * 60 * 60 * 1000); // si tu backend espera UTC-4
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      selected_date: start.toISOString().split("T")[0],
      starting_time: start.toISOString(),
      finishing_time: end.toISOString(),
    };
  }

  async function fetchExisting() {
    try {
      const url =
        `${API_BASE}/api/crud_read/appointments/get_modal_form` +
        `?fixer_id=${encodeURIComponent(fixerId)}` +
        `&requester_id=${encodeURIComponent(requesterId)}` +
        `&appointment_date=${encodeURIComponent(ymd(pastDate))}` +
        `&start_hour=${encodeURIComponent(String(startHour(pastDate)))}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();
      const ap = data?.data || {};

      setClient(ap.current_requester_name || "");
      setContact(ap.current_requester_phone || "");
      setDescription(ap.appointment_description || "");
      const isPresential = ap.appointment_type === "presential";
      setModality(isPresential ? "presential" : "virtual");
      if (isPresential) {
        const lat = ap.latitude != null ? Number(ap.latitude) : undefined;
        const lon = ap.longitude != null ? Number(ap.longitude) : undefined;
        const address = ap.display_name_location || "";
        if (Number.isFinite(lat) && Number.isFinite(lon) && address) {
          setLocation({ lat: lat as number, lon: lon as number, address });
          setPlace(address);
        }
      } else {
        setMeetingLink(ap.link_id || "");
      }
    } catch (e) {
      console.error("No se pudo cargar la cita original:", e);
    }
  }

  function handleLocationConfirm(loc: { lat: number; lon: number; address: string }) {
    setLocation(loc); setPlace(loc.address); setShowLocationModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData = {
      client, contact, description, modality,
      meetingLink: modality === "virtual" ? meetingLink : undefined,
      location: modality === "presential" ? location : undefined,
    };
    const validation = appointmentSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const key = (Array.isArray(err.path) && err.path[0]) || "general";
        fieldErrors[key as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!newDatetime) {
      setErrors({ general: "Selecciona la nueva fecha y hora (desde el calendario) antes de reprogramar." });
      return;
    }

    const { selected_date, starting_time, finishing_time } = parseNewTimes(newDatetime);
    const payload = {
      id_fixer: fixerId,
      id_requester: requesterId,
      selected_date,
      starting_time,
      finishing_time,
      schedule_state: "booked",
      appointment_type: modality,
      appointment_description: description,
      current_requester_name: client,
      current_requester_phone: contact,
      link_id: modality === "virtual" ? meetingLink : "",
      display_name_location: modality === "presential" ? place : "",
      lat: modality === "presential" ? location?.lat ?? null : null,
      lon: modality === "presential" ? location?.lon ?? null : null,
      // cancellation_reason: motivo, // si tu backend lo soporta
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/crud_create/appointments/create`, payload);
      const data = res.data;

      const startLocal = new Date(payload.starting_time);
      const hourStr = `${String(startLocal.getHours()).padStart(2, "0")}:00`;

      if (data?.success) {
        setSummaryData({
          name: client,
          date: startLocal.toLocaleDateString(),
          time: hourStr,
          modality,
          locationOrLink: modality === "virtual" ? meetingLink : place,
          description,
          motive: motivo || undefined,
        });
        setShowSummary(true);
      } else {
        setErrors({ general: data?.message || "No se pudo reprogramar" });
      }
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || "No se pudo reprogramar";
      setErrors({ general: backendMessage });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-title"
          className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-auto overflow-auto"
          style={{ maxHeight: "90vh" }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <h3 id="reschedule-title" className="text-lg font-semibold text-black">Reprogramar cita</h3>
              <button aria-label="Cerrar" className="text-gray-500 hover:text-gray-700" onClick={handleClose}>✕</button>
            </div>

            <p className="mt-2 text-xs text-gray-500">Cita actual: {new Date(pastDate).toLocaleString()}</p>
            {motivo && <p className="mt-1 text-xs text-gray-600">Motivo: <span className="italic">{motivo}</span></p>}
            {newDatetime && (
              <p className="mt-1 text-xs text-indigo-600">
                Nueva fecha/hora: {new Date(newDatetime).toLocaleString()}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded">
                <label className="block">
                  <span className="text-sm font-medium">Fecha y hora nueva *</span>
                  <input
                    readOnly
                    value={newDatetime ? new Date(newDatetime).toLocaleString() : ""}
                    className="mt-1 block w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm"
                    placeholder="Selecciona un slot en el calendario"
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
                    ref={firstRef}
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                    placeholder="Nombre del cliente"
                  />
                  {errors.client && <p className="text-red-600 text-sm mt-1">{errors.client}</p>}
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Contacto *</span>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                    placeholder="7XXXXXXX"
                    maxLength={8}
                  />
                  {errors.contact && <p className="text-red-600 text-sm mt-1">{errors.contact}</p>}
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Descripción del trabajo *</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                  rows={3}
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </label>

              {modality === "presential" ? (
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
              ) : (
                <label className="block">
                  <span className="text-sm font-medium">Enlace de reunión *</span>
                  <input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white"
                    placeholder="https://meet.example.com/..."
                  />
                  {errors.meetingLink && <p className="text-red-600 text-sm mt-1">{errors.meetingLink}</p>}
                </label>
              )}

              {errors.general && <p className="text-red-600 text-sm mt-1">{errors.general}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 rounded bg-gray-300 text-sm">
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-[#2B6AE0] text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Reprogramar"}
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
            onSuccess?.();
          }}
          data={summaryData}
        />
      )}
    </>
  );
});

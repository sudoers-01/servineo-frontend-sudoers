"use client";
import { useEffect, useRef, useState } from "react";
import AppointmentForm from "../../appointments/forms/AppointmentForm";
import type { AppointmentFormHandle } from "../../appointments/forms/AppointmentForm";
import EditAppointmentForm from "../../appointments/forms/EditAppointmentForm";
import type { EditAppointmentFormHandle, ExistingAppointment } from "../../appointments/forms/EditAppointmentForm";

// BASE DE DATOS (DE MOMENTO POSTMAN)
const API = process.env.NEXT_PUBLIC_API_BASE_URL;

interface DayScheduleProps {
  fixerId: string;
  requesterId: string;
  selectedDate: Date | null;
}

interface HorarioItem {
  id_Horario: string;
  Hora_Inicio: string;
  estado_Horario: string;
  cliente?: string;
  contacto?: string;
  modalidad?: "virtual" | "presencial";
  descripcion?: string;
  lugar?: string;
  meetingLink?: string;
  type?: string;
  text?: string;
}

interface DayData {
  nombre_Fixer?: string;
  horarios?: HorarioItem[];
}

export default function DaySchedule({
  fixerId,
  requesterId,
  selectedDate,
}: DayScheduleProps) {
  const formattedDate = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : ""; // "yyyy-mm-dd"

  const [date, setDate] = useState<string>(formattedDate);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DayData | null>(null);
  const [err, setErr] = useState<string>("");

  const appointmentFormRef = useRef<AppointmentFormHandle | null>(null);
  const editAppointmentFormRef = useRef<EditAppointmentFormHandle | null>(null);

  const fetchDay = async (d: string) => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(
        `${API}/fixers/${fixerId}/availability?fecha_Seleccionada=${d}`
      );
      if (!res.ok) throw new Error("No se pudo cargar la disponibilidad");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setErr((e as Error).message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) fetchDay(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labelByEstado = (estado: string) => {
    switch (estado) {
      case "libre":
        return { text: "DISPONIBLE", cls: "text-emerald-600", icon: "＋" };
      case "ocupado":
        return { text: "RESERVADO", cls: "text-amber-500", icon: "✎" };
      case "no_disponible":
        return { text: "NO DISPONIBLE", cls: "text-slate-400", icon: null };
      default:
        return { text: "", cls: "", icon: null };
    }
  };

  const handleSlotClick = (item: HorarioItem) => {
    const meta = labelByEstado(item.estado_Horario);
    if (meta.icon === "＋") {
      // Abrir AppointmentForm como modal
      appointmentFormRef.current?.open(
        `${date}T${item.Hora_Inicio}:00`,
        { eventId: item.id_Horario, title: meta.text }
      );
    } else if (meta.icon === "✎") {
      // Abrir EditAppointmentForm como modal
      const existingAppointment: ExistingAppointment = {
        id: item.id_Horario,
        datetime: `${date}T${item.Hora_Inicio}:00`,
        client: item.cliente || "",
        contact: item.contacto || "",
        modality: item.modalidad || "virtual",
        description: item.descripcion || meta.text,
        place: item.lugar || "",
        meetingLink: item.meetingLink || "",
      };
      editAppointmentFormRef.current?.open(existingAppointment);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-4 text-black">
      <h1 className="text-2xl font-semibold mb-3">
        Calendario de {data?.nombre_Fixer ?? "—"}
      </h1>

      <div className="mb-3">
        <label className="block text-sm mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            const d = e.target.value;
            setDate(d);
            fetchDay(d);
          }}
          className="w-full rounded-lg border p-2"
        />
      </div>

      {loading && <div className="text-slate-500">Cargando…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {data && (
        <div className="rounded-xl bg-slate-100 p-3 text-black">
          <div className="text-sm font-semibold text-slate-600 mb-2">
            {new Date(date).toLocaleDateString("es-BO", {
              day: "2-digit",
              month: "long",
            })}
          </div>

          <div className="space-y-2">
            {data.horarios?.map((item: HorarioItem, idx: number) => {
              if (item.type === "banner") {
                return (
                  <div
                    key={`banner-${idx}`}
                    className="rounded-lg bg-rose-500 text-white text-center text-xs font-semibold py-2"
                  >
                    {item.text}
                  </div>
                );
              }

              const meta = labelByEstado(item.estado_Horario);
              const clickable = meta.icon === "＋" || meta.icon === "✎";

              return (
                <div
                  key={item.id_Horario}
                  onClick={() => clickable && handleSlotClick(item)}
                  className={`grid grid-cols-[64px_1fr_28px] items-center rounded-lg border bg-white px-3 py-2 shadow-sm ${
                    item.estado_Horario === "no_disponible"
                      ? "opacity-60"
                      : clickable
                      ? "hover:bg-slate-50 cursor-pointer"
                      : ""
                  }`}
                >
                  <div className="font-semibold text-slate-800">
                    {item.Hora_Inicio}
                  </div>
                  <div className={`text-sm font-semibold ${meta.cls}`}>
                    {meta.text}
                  </div>
                  <div className="text-xl text-slate-500 text-right">
                    {meta.icon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Renderizar los formularios una sola vez */}
      <AppointmentForm ref={appointmentFormRef} />
      <EditAppointmentForm ref={editAppointmentFormRef} />
    </div>
  );
}
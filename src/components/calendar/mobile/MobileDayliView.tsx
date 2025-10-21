"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AppointmentForm from "../../appointments/forms/AppointmentForm";
import type { AppointmentFormHandle } from "../../appointments/forms/AppointmentForm";
import EditAppointmentForm from "../../appointments/forms/EditAppointmentForm";
import type {
  EditAppointmentFormHandle,
  ExistingAppointment,
} from "../../appointments/forms/EditAppointmentForm";

const AVAILABILITY_URL =
  "https://servineo-backend-lorem.onrender.com/api/crud_read/appointments/get_meeting_status";
const DEFAULT_FIXER_NAME = "John";

interface DayScheduleProps {
  fixerId: string;
  requesterId: string;
  selectedDate: Date | string | null;
}

interface HorarioItem {
  id_Horario: string;
  Hora_Inicio: string;
  estado_Horario: "libre" | "ocupado" | "no_disponible";
  cliente?: string;
  contacto?: string;
  modalidad?: "virtual" | "presencial";
  descripcion?: string;
  lugar?: string;
  meetingLink?: string;
  type?: "banner";
  text?: string;
}

interface DayData {
  nombre_Fixer?: string;
  horarios?: HorarioItem[];
}

type Icon = "＋" | "✎" | null;
type ApiStatus = "occupied" | "cancelled" | "booked" | "available";

interface HourApiResponse {
  message: string;
  name: string;
  status: ApiStatus;
}

function ymdToLocalDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toYMDAny(d: Date | string) {
  const date = typeof d === "string" ? ymdToLocalDate(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}


function hourIntsRange(start = 8, end = 18) {
  const out: number[] = [];
  for (let h = start; h <= end; h++) out.push(h);
  return out;
}


function formatHourDisplay(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}
function mapApiToEstado(s: ApiStatus): HorarioItem["estado_Horario"] {
  switch (s) {
    case "occupied":
      return "no_disponible";
    case "booked":
      return "ocupado";
    case "available":
      return "libre";
    case "cancelled":
      return "libre";
    default:
      return "no_disponible";
  }
}


async function fetchHour(
  id_fixer: string,
  id_requester: string,
  selected_date: string,
  starting_time: number
): Promise<HourApiResponse> {
  const { data } = await axios.get<HourApiResponse>(AVAILABILITY_URL, {
    params: { id_fixer, id_requester, selected_date, starting_time },
    headers: { Accept: "application/json" },
  });
  return data;
}



export default function DaySchedule({
  fixerId,
  requesterId,
  selectedDate,
}: DayScheduleProps) {
  //console.log("Fecha recibida:", selectedDate);

  const formattedDate = selectedDate ? toYMDAny(selectedDate as any) : "";

  const [date, setDate] = useState<string>(formattedDate);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DayData | null>(null);
  const [err, setErr] = useState<string>("");

  const appointmentFormRef = useRef<AppointmentFormHandle | null>(null);
  const editAppointmentFormRef = useRef<EditAppointmentFormHandle | null>(null);

  // --- Timers para ráfaga de refrescos
  const refreshTimerRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  function clearRefreshTimers() {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (refreshIntervalRef.current) {
      window.clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }

  function kickRefreshBurst(targetDate?: string) {
    const d = targetDate || date;
    if (!d) return;

    clearRefreshTimers();

    // intento rápido
    refreshTimerRef.current = window.setTimeout(() => fetchDay(d), 1200);

    // 4 intentos cada 2s (≈9s total con el primero)
    let attempts = 0;
    refreshIntervalRef.current = window.setInterval(() => {
      attempts++;
      fetchDay(d);
      if (attempts >= 4) {
        clearRefreshTimers();
      }
    }, 2000);
  }

  const labelByEstado = (
    estado: "libre" | "ocupado" | "no_disponible"
  ): { text: string; cls: string; icon: Icon } => {
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

  async function fetchDay(d: string) {
    try {
      setLoading(true);
      setErr("");
      const hours = hourIntsRange(8, 18);
      const results = await Promise.all(
        hours.map(async (h) => {
          try {
            const resp = await fetchHour(fixerId, requesterId, d, h);
            return { ok: true as const, hourInt: h, resp };
          } catch (e) {
            return { ok: false as const, hourInt: h, error: e as Error };
          }
        })
      );
      const nombre_Fixer = DEFAULT_FIXER_NAME;
      const horarios: HorarioItem[] = [];
      for (const r of results) {
        const horaDisplay = formatHourDisplay(r.hourInt);
        const baseId = `${d}-${String(r.hourInt).padStart(2, "0")}`;
        if (r.ok) {
          const estado = mapApiToEstado(r.resp.status);
          horarios.push({
            id_Horario: baseId,
            Hora_Inicio: horaDisplay,
            estado_Horario: estado,
          });
          if (r.resp.status === "cancelled") {
            horarios.push({
              id_Horario: `${baseId}-banner`,
              Hora_Inicio: horaDisplay,
              estado_Horario: "libre",
              type: "banner",
              text: "CANCELADO POR EL USUARIO",
            });
          }
        } else {
          horarios.push({
            id_Horario: baseId,
            Hora_Inicio: horaDisplay,
            estado_Horario: "no_disponible",
          });
        }
      }
      setData({ nombre_Fixer, horarios });
    } catch (e) {
      setErr((e as Error).message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (date) fetchDay(date);
  }, []);


  useEffect(() => {
    if (selectedDate) {
      const d = toYMDAny(selectedDate as any);
      setDate(d);
      fetchDay(d);
    }
  }, [selectedDate, fixerId, requesterId]);

  // Refrescar al volver a foco/visibilidad
  useEffect(() => {
    const onFocus = () => {
      if (date) fetchDay(date);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && date) fetchDay(date);
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [date, fixerId, requesterId]);

  // Limpieza de timers al desmontar
  useEffect(() => {
    return () => {
      clearRefreshTimers();
    };
  }, []);

  const handleSlotClick = (item: HorarioItem) => {
    if (item.type === "banner") return;
    const meta = labelByEstado(item.estado_Horario);

    if (meta.icon === "＋") {
      console.log("fecha bien formateada: ",`${date}T${item.Hora_Inicio}:00`);
      const currentDate=new Date(date);
      console.log("current date antes de formatear: ", currentDate.toISOString());
      const currentYear = currentDate.getUTCFullYear();
      const currentMonth = currentDate.getUTCMonth();
      const currentDay = currentDate.getUTCDate();
      const currentHour= parseInt(item.Hora_Inicio);
      const finalDate=new Date(Date.UTC(currentYear,currentMonth,currentDay,(currentHour+4),0,0));
      //appointmentFormRef.current?.open(`${date}T${item.Hora_Inicio}:00`, {
      appointmentFormRef.current?.open(finalDate.toISOString(),{
        eventId: item.id_Horario,
        title: meta.text,
      });
      console.log("final date anio",currentYear);
      console.log("final date mes",currentMonth);
      console.log("final date dia",currentDay);
      console.log("final date hora",currentHour+4);
      console.log("Fecha formateada: ", finalDate.toISOString());
      // Ráfaga de refrescos tras abrir el formulario de creación
      kickRefreshBurst(date);
    } else if (meta.icon === "✎") {
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
      // Ráfaga de refrescos tras abrir el formulario de edición
      kickRefreshBurst(date);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-4 text-black">
      <h1 className="text-2xl font-semibold mb-3">
        Calendario de {data?.nombre_Fixer ?? DEFAULT_FIXER_NAME}
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
      {err && <div className="text-red-600">{String(err)}</div>}

      {data && (
        <div className="rounded-xl bg-slate-100 p-3 text-black">
          <div className="text-sm font-semibold text-slate-600 mb-2">
            {date
              ? ymdToLocalDate(date).toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "long",
                })
              : ""}
          </div>

          <div className="space-y-2">
            {data.horarios?.map((item: HorarioItem, idx: number) => {
              if (item.type === "banner") {
                return (
                  <div
                    key={item.id_Horario || `banner-${idx}`}
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
                  <div className="font-semibold text-slate-800">{item.Hora_Inicio}</div>
                  <div className={`text-sm font-semibold ${meta.cls}`}>{meta.text}</div>
                  <div className="text-xl text-slate-500 text-right">{meta.icon}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AppointmentForm ref={appointmentFormRef} fixerId={fixerId} requesterId={requesterId} />
      <EditAppointmentForm ref={editAppointmentFormRef} />
    </div>
  );
}

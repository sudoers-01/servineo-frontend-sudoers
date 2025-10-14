"use client";
import { useEffect, useRef, useState } from "react";
import AppointmentForm from "../../appointments/forms/AppointmentForm";
import type { AppointmentFormHandle } from "../../appointments/forms/AppointmentForm";
import EditAppointmentForm from "../../appointments/forms/EditAppointmentForm";
import type {
  EditAppointmentFormHandle,
  ExistingAppointment,
} from "../../appointments/forms/EditAppointmentForm";

const USE_BACKEND = true; 
const API = process.env.NEXT_PUBLIC_BACKEND as string;
const AVAILABILITY_URL = `${API}/api/crud_read/appointments/get_meeting_status`;

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


function toYMDAny(d: Date | string) {
  const date = typeof d === "string" ? new Date(`${d}T00:00:00`) : d;
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


const MOCK_FIXER_NAME = "Juan";

function mockHorarios(fechaYMD: string): { nombre_Fixer: string; horarios: HorarioItem[] } {
  const horarios = hourIntsRange(8, 18).map<HorarioItem>((h) => {
    const estado: HorarioItem["estado_Horario"] =
      h % 2 === 0 ? "libre" : h % 5 === 0 ? "no_disponible" : "ocupado";

    const base: HorarioItem = {
      id_Horario: `${fechaYMD}-${String(h).padStart(2, "0")}`,
      Hora_Inicio: formatHourDisplay(h),
      estado_Horario: estado,
    };

    if (estado === "ocupado") {
      base.cliente = "Juan Pérez";
      base.contacto = "+591 7xx xx xx";
      base.modalidad = "virtual";
      base.descripcion = "Trabajo en curso";
      base.lugar = "Av. Siempre Viva 123";
      base.meetingLink = "https://meet.mock/abc";
    }

    return base;
  });

  return { nombre_Fixer: MOCK_FIXER_NAME, horarios };
}


type HourApiStatus = "available" | "partial" | "occuped";

interface HourApiResponse {
  message: string;
  status: HourApiStatus;
  name: string; 
}

function mapApiToEstado(status: HourApiStatus): HorarioItem["estado_Horario"] {
  switch (status) {
    case "available":
      return "libre";  
    case "partial":
      return "ocupado";
    case "occuped":
      return "no_disponible";
    default:
      return "no_disponible";
  }
}


async function fetchHour(
  baseUrl: string,
  fixerId: string,
  requesterId: string,
  ymd: string,
  hourInt: number
): Promise<HourApiResponse> {
  const url = new URL(baseUrl);
  url.searchParams.set("fixerId", fixerId);
  url.searchParams.set("requesterId", requesterId);
  url.searchParams.set("date", ymd);
  url.searchParams.set("hour", String(hourInt));

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as HourApiResponse;
  return json;
}


export default function DaySchedule({
  fixerId,
  requesterId,
  selectedDate,
}: DayScheduleProps) {
  const formattedDate = selectedDate ? toYMDAny(selectedDate as any) : "";

  const [date, setDate] = useState<string>(formattedDate);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DayData | null>(null);
  const [err, setErr] = useState<string>("");

  const appointmentFormRef = useRef<AppointmentFormHandle | null>(null);
  const editAppointmentFormRef = useRef<EditAppointmentFormHandle | null>(null);

  const labelByEstado = (estado: "libre" | "ocupado" | "no_disponible"): {
    text: string;
    cls: string;
    icon: Icon;
  } => {
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

      if (!USE_BACKEND) {
        const { nombre_Fixer, horarios } = mockHorarios(d);
        setData({ nombre_Fixer, horarios });
        return;
      }

      const hours = hourIntsRange(8, 18); 

      const results = await Promise.all(
        hours.map(async (h) => {
          try {
            const resp = await fetchHour(AVAILABILITY_URL, fixerId, requesterId, d, h);
            return { ok: true as const, hourInt: h, resp };
          } catch {
            return { ok: false as const, hourInt: h };
          }
        })
      );

      const firstOk = results.find((r) => r.ok);
      const nombre_Fixer = firstOk && firstOk.ok ? firstOk.resp.name : "—";

      const horarios: HorarioItem[] = results.map((r) => {
        const horaDisplay = formatHourDisplay(r.hourInt);
        if (r.ok) {
          return {
            id_Horario: `${d}-${String(r.hourInt).padStart(2, "0")}`,
            Hora_Inicio: horaDisplay,
            estado_Horario: mapApiToEstado(r.resp.status),
          };
        }
        return {
          id_Horario: `${d}-${String(r.hourInt).padStart(2, "0")}`,
          Hora_Inicio: horaDisplay,
          estado_Horario: "no_disponible",
        };
      });

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

  const handleSlotClick = (item: HorarioItem) => {
    const meta = labelByEstado(item.estado_Horario);
    if (meta.icon === "＋") {
      appointmentFormRef.current?.open(`${date}T${item.Hora_Inicio}:00`, {
        eventId: item.id_Horario,
        title: meta.text,
      });
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

      <AppointmentForm ref={appointmentFormRef} />
      <EditAppointmentForm ref={editAppointmentFormRef} />
    </div>
  );
}

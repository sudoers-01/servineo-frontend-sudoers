"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AppointmentForm from "../../appointments/forms/AppointmentForm";
import type { AppointmentFormHandle } from "../../appointments/forms/AppointmentForm";
import EditAppointmentForm from "../../appointments/forms/EditAppointmentForm";
import type { EditAppointmentFormHandle, ExistingAppointment } from "../../appointments/forms/EditAppointmentForm";
import DatePicker from "@/components/list/DatePicker/DatePicker";

const API_BASE = "https://servineo-backend-lorem.onrender.com";
const EP_BOOKED = `${API_BASE}/api/crud_read/schedules/get_by_fixer_current_requester_day`;
const EP_OCCUPIED = `${API_BASE}/api/crud_read/schedules/get_by_fixer_other_requesters_day`;
const NOMBRE_FIXER_POR_DEFECTO = "John";

interface PropiedadesHorarioDia {
  fixerId: string;
  requesterId: string;
  selectedDate: Date | string | null;
  onDateChange?: (newDate: Date) => void;
}

type Estado = "libre" | "reservado_propio" | "ocupado_otro" | "no_disponible";

interface HorarioItem {
  id_Horario: string;
  Hora_Inicio: string;
  estado_Horario: Estado;
  type?: "banner";
  text?: string;
}

interface DatosDia {
  nombre_Fixer?: string;
  horarios?: HorarioItem[];
}

type Icono = "＋" | "✎" | null;

type SchedState = "booked" | "occupied";
interface SchedRow {
  starting_hour: number;
  finishing_hour: number;
  schedule_state: SchedState;
}

function convertirYMDaFechaLocal(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function aYMDDeCualquiera(d: Date | string) {
  const fecha = typeof d === "string" ? convertirYMDaFechaLocal(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}
function rangoHorasEnteras(inicio = 8, fin = 17) {
  const arr: number[] = [];
  for (let h = inicio; h <= fin; h++) arr.push(h);
  return arr;
}
function formatearHora(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}
function esPasadoYMD(d: string) {
  const hoy = aYMDDeCualquiera(new Date());
  return d < hoy;
}
function esFinDeSemanaYMD(d: string) {
  const fecha = convertirYMDaFechaLocal(d);
  const dia = fecha.getDay();
  return dia === 0 || dia === 6;
}

async function fetchSched(
  urlBase: string,
  params: { fixer_id: string; requester_id: string; searched_date: string },
  signal?: AbortSignal
) {
  const url = new URL(urlBase);
  url.searchParams.set("fixer_id", params.fixer_id);
  url.searchParams.set("requester_id", params.requester_id);
  url.searchParams.set("searched_date", params.searched_date);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} en ${url.pathname} ${text}`);
  }
  const data = await res.json().catch(() => null);
  return Array.isArray(data) ? (data as SchedRow[]) : [];
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
function convertToDate(selectedDate: Date | string | null): Date {
  if (!selectedDate) return new Date();
  if (selectedDate instanceof Date) {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    return new Date(year, month, day, 12, 0, 0);
  }
  if ((selectedDate as string).includes("T")) return new Date(selectedDate as string);
  return new Date(`${selectedDate}T12:00:00`);
}

export default function HorarioDelDia({
  fixerId,
  requesterId,
  selectedDate,
  onDateChange,
}: PropiedadesHorarioDia) {
  const fechaFormateadaInicial = selectedDate ? aYMDDeCualquiera(selectedDate as any) : "";
  const [fecha, setFecha] = useState<string>(fechaFormateadaInicial);
  const [cargando, setCargando] = useState<boolean>(false);
  const [datos, setDatos] = useState<DatosDia | null>(null);
  const [error, setError] = useState<string>("");

  const refFormularioCita = useRef<AppointmentFormHandle | null>(null);
  const refFormularioEditarCita = useRef<EditAppointmentFormHandle | null>(null);

  const refAbort = useRef<AbortController | null>(null);
  const refReqSeq = useRef(0);
  const refActiveLoads = useRef(0);

  const [date, setDate] = useState<string>(selectedDate ? toYMDAny(selectedDate as any) : "");

  const fechaInicial = convertToDate(selectedDate);

  const handleDatePickerChange = (newDate: Date) => {
    const newDateStr = toYMDAny(newDate);
    setDate(newDateStr);
    onDateChange?.(newDate);
  };

  useEffect(() => {
    if (selectedDate) {
      const d = toYMDAny(selectedDate as any);
      setDate(d);
    }
  }, [selectedDate]);

  function setFechaYCancelar(d: string) {
    setFecha(d);
    if (refAbort.current) {
      refAbort.current.abort();
      refAbort.current = null;
    }
  }

  async function obtenerDia(d: string) {
    try {
      if (refAbort.current) refAbort.current.abort();
      const ac = new AbortController();
      refAbort.current = ac;
      const myReq = ++refReqSeq.current;

      refActiveLoads.current += 1;
      setCargando(true);
      setError("");

      const horas = rangoHorasEnteras(8, 17);

      if (esPasadoYMD(d) || esFinDeSemanaYMD(d)) {
        const horarios: HorarioItem[] = horas.map((h) => ({
          id_Horario: `${d}-${String(h).padStart(2, "0")}`,
          Hora_Inicio: formatearHora(h),
          estado_Horario: "no_disponible",
        }));
        if (myReq === refReqSeq.current) setDatos({ nombre_Fixer: NOMBRE_FIXER_POR_DEFECTO, horarios });
        return;
      }

      const [bookedRows, occupiedRows] = await Promise.all([
        fetchSched(EP_BOOKED, { fixer_id: fixerId, requester_id: requesterId, searched_date: d }, ac.signal),
        fetchSched(EP_OCCUPIED, { fixer_id: fixerId, requester_id: requesterId, searched_date: d }, ac.signal),
      ]);

      const bookedSet = new Set<number>();
      const occupiedSet = new Set<number>();
      for (const r of bookedRows) {
        if (r.schedule_state === "booked") bookedSet.add(Number(r.starting_hour));
      }
      for (const r of occupiedRows) {
        if (r.schedule_state === "occupied") occupiedSet.add(Number(r.starting_hour));
      }

      const horarios: HorarioItem[] = [];
      for (const h of horas) {
        const horaMostrar = formatearHora(h);
        const idBase = `${d}-${String(h).padStart(2, "0")}`;

        if (h === 12 || h === 13) {
          horarios.push({ id_Horario: idBase, Hora_Inicio: horaMostrar, estado_Horario: "no_disponible" });
          continue;
        }

        if (occupiedSet.has(h)) {
          horarios.push({ id_Horario: idBase, Hora_Inicio: horaMostrar, estado_Horario: "ocupado_otro" });
        } else if (bookedSet.has(h)) {
          horarios.push({ id_Horario: idBase, Hora_Inicio: horaMostrar, estado_Horario: "reservado_propio" });
        } else {
          horarios.push({ id_Horario: idBase, Hora_Inicio: horaMostrar, estado_Horario: "libre" });
        }
      }

      if (myReq === refReqSeq.current && !ac.signal.aborted) {
        setDatos({ nombre_Fixer: NOMBRE_FIXER_POR_DEFECTO, horarios });
      }
    } catch (e: any) {
      const isAbort =
        e?.name === "AbortError" ||
        e?.name === "CanceledError" ||
        e?.code === "ERR_CANCELED" ||
        (typeof axios.isCancel === "function" && axios.isCancel(e));
      if (!isAbort) setError(e?.message || "Error");
    } finally {
      refActiveLoads.current = Math.max(0, refActiveLoads.current - 1);
      if (refActiveLoads.current === 0) setCargando(false);
      if (refAbort.current) refAbort.current = null;
    }
  }

  useEffect(() => {
    if (fecha) obtenerDia(fecha);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const d = aYMDDeCualquiera(selectedDate as any);
      setFechaYCancelar(d);
      setCargando(true);
      obtenerDia(d);
    }
  }, [selectedDate, fixerId, requesterId]);

  async function cargarYEditarCita(item: HorarioItem) {
    try {
      if (!fecha) return;
      const [y, m, d] = fecha.split("-").map(Number);
      const [hh] = (item.Hora_Inicio || "00:00").split(":");
      const horaLocal = parseInt(hh, 10);

      const isoParaEditar = new Date(Date.UTC(y, m - 1, d, horaLocal + 4, 0, 0)).toISOString();

      const url =
        `${API_BASE}/api/crud_read/appointments/get_modal_form` +
        `?fixer_id=${encodeURIComponent(fixerId)}` +
        `&requester_id=${encodeURIComponent(requesterId)}` +
        `&appointment_date=${encodeURIComponent(fecha)}` +
        `&start_hour=${encodeURIComponent(String(horaLocal))}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const body = await res.text().catch(() => "<sin cuerpo>");
        alert(`Error ${res.status} al consultar la cita.\n${body}`);
        return;
      }
      const data = await res.json();

      const modality = data?.data?.appointment_type === "presential" ? "presencial" : "virtual";

      const existingAppointment: ExistingAppointment = {
        id: data?.data?._id || data?.data?.id || `${fecha}-${hh}`,
        datetime: isoParaEditar,
        client: data?.data?.current_requester_name || "",
        contact: data?.data?.current_requester_phone || "",
        modality,
        description: data?.data?.appointment_description || "",
        meetingLink: data?.data?.link_id || "",
        lat: data?.data?.latitude !== undefined && data?.data?.latitude !== null ? Number(data.data.latitude) : undefined,
        lon: data?.data?.longitude !== undefined && data?.data?.longitude !== null ? Number(data.data.longitude) : undefined,
        address: data?.data?.display_name_location || "",
        place: "",
        fixerId,
        requesterId,
      };

      refFormularioEditarCita.current?.open(existingAppointment);
    } catch (err) {
      alert("Error al cargar los datos de la cita para editar. Revisa consola.");
      console.error(err);
    }
  }

  const etiquetaPorEstado = (
    estado: Estado
  ): { text: string; icon: Icono; textCls: string; rowCls: string } => {
    switch (estado) {
      case "libre":
        return { text: "DISPONIBLE", icon: "＋", textCls: "text-emerald-600", rowCls: "bg-white" };
      case "reservado_propio":
        return { text: "RESERVADO", icon: "✎", textCls: "text-amber-500", rowCls: "bg-white" };
      case "ocupado_otro":
        return { text: "OCUPADO", icon: null, textCls: "text-white", rowCls: "bg-rose-600" };
      case "no_disponible":
      default:
        return { text: "NO DISPONIBLE", icon: null, textCls: "text-slate-400", rowCls: "bg-white opacity-60" };
    }
  };

  const manejarClickEnSlot = (item: HorarioItem) => {
    const clickeable = item.estado_Horario === "libre" || item.estado_Horario === "reservado_propio";
    if (!clickeable) return;

    const ymd = fecha || toYMDAny(selectedDate || new Date());
    const baseDate = convertirYMDaFechaLocal(ymd);
    const hour = parseInt(item.Hora_Inicio.split(":")[0], 10);

    const slotDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, 0, 0, 0);

    if (item.estado_Horario === "libre") {
      refFormularioCita.current?.open(slotDate.toISOString());
      return;
    }

    if (item.estado_Horario === "reservado_propio") {
      cargarYEditarCita(item);
    }
  };

  const noHayHorariosDisponibles = !!datos && (datos.horarios ?? []).every((it) => it.estado_Horario !== "libre");

  return (
    <div className="mx-auto max-w-sm p-4 text-black">
      <h1 className="text-2xl font-semibold mb-3">Calendario de Diego Paredes</h1>

      <div className="mb-3">
        <label className="block text-sm mb-1">Fecha</label>
        <DatePicker selectedDate={fechaInicial} onDateChange={handleDatePickerChange} />
      </div>

      {cargando && (
        <div className="mb-2 rounded-md bg-slate-100 text-slate-600 px-3 py-2 text-sm font-medium">
          Cargando…
        </div>
      )}
      {error && <div className="text-red-600">{String(error)}</div>}

      {datos && (
        <div className="rounded-xl bg-slate-100 p-3 text-black">
          <div className="text-sm font-semibold text-slate-600 mb-2">
            {fecha ? convertirYMDaFechaLocal(fecha).toLocaleDateString("es-BO", { day: "2-digit", month: "long" }) : ""}
          </div>

          <div className="space-y-2">
            {datos.horarios?.map((item, idx) => {
              const meta = etiquetaPorEstado(item.estado_Horario);
              const clickeable = item.estado_Horario === "libre" || item.estado_Horario === "reservado_propio";
              return (
                <div
                  key={item.id_Horario || `slot-${idx}`}
                  onClick={() => clickeable && manejarClickEnSlot(item)}
                  className={`grid grid-cols-[64px_1fr_28px] items-center rounded-lg border px-3 py-2 shadow-sm ${meta.rowCls} ${
                    clickeable ? "hover:brightness-95 cursor-pointer" : ""
                  }`}
                >
                  <div className={`font-semibold ${item.estado_Horario === "ocupado_otro" ? "text-white" : "text-slate-800"}`}>
                    {item.Hora_Inicio}
                  </div>
                  <div className={`text-sm font-semibold ${meta.textCls}`}>{meta.text}</div>
                  <div className={`text-xl text-right ${item.estado_Horario === "ocupado_otro" ? "text-white" : "text-slate-500"}`}>
                    {meta.icon}
                  </div>
                </div>
              );
            })}
          </div>

          {noHayHorariosDisponibles && !cargando && (
            <div className="mt-3 text-center text-sm font-semibold text-slate-600">No hay horarios disponibles</div>
          )}
        </div>
      )}

      <AppointmentForm ref={refFormularioCita} fixerId={fixerId} requesterId={requesterId} />
      <EditAppointmentForm ref={refFormularioEditarCita} />
    </div>
  );
}

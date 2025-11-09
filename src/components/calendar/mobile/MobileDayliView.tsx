"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AppointmentForm from "../../appointments/forms/AppointmentForm";
import type { AppointmentFormHandle } from "../../appointments/forms/AppointmentForm";
import EditAppointmentForm from "../../appointments/forms/EditAppointmentForm";
import type { EditAppointmentFormHandle, ExistingAppointment } from "../../appointments/forms/EditAppointmentForm";
import DatePicker from "@/components/list/DatePicker/DatePicker";
import { useUserRole } from "@/utils/contexts/UserRoleContext";
import { useAppointmentsContext } from "@/utils/contexts/AppointmentsContext/AppoinmentsContext";

const API_BASE = "https://servineo-backend-lorem.onrender.com";

interface PropiedadesHorarioDia {
    fixerId: string;
    requesterId: string;
    selectedDate: Date | string | null;
    onDateChange?: (newDate: Date) => void;
    pickerMode?: boolean;
    onSlotSelect?: (iso: string) => void;
}

type Estado = "disponible" | "reservado" | "cancelado_por_fixer" | "cancelado_por_requester" | "no_disponible";

interface HorarioItem {
    id_Horario: string;
    Hora_Inicio: string;
    estado_Horario: Estado;
}

interface DatosDia {
    horarios?: HorarioItem[];
}

type Icono = "＋" | "✎" | null;

// Convierte string YYYY-MM-DD a objeto Date local
function convertirYMDaFechaLocal(ymd: string) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
}

// Convierte Date o string a formato YYYY-MM-DD
function aYMDDeCualquiera(d: Date | string) {
    const fecha = typeof d === "string" ? convertirYMDaFechaLocal(d) : d;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

// Genera array de horas [0, 1, 2, ..., 23]
function rangoHorasEnteras(inicio = 0, fin = 23) {
    const arr: number[] = [];
    for (let h = inicio; h <= fin; h++) arr.push(h);
    return arr;
}

function formatearHora(h: number) {
    return `${String(h).padStart(2, "0")}:00`;
}

// Obtiene fecha/hora actual en Bolivia (UTC-4)
function obtenerAhoraBolivia(): Date {
    const ahora = new Date();
    const utc = ahora.getTime() + (ahora.getTimezoneOffset() * 60000);
    const boliviaTime = new Date(utc - (4 * 60 * 60 * 1000));
    return boliviaTime;
}

// Verifica si una fecha YYYY-MM-DD ya pasó
function esPasadoYMD(d: string) {
    const hoyBolivia = obtenerAhoraBolivia();
    const hoy = aYMDDeCualquiera(hoyBolivia);
    return d < hoy;
}

// Verifica si una hora específica de hoy ya pasó
function esHoraPasadaHoy(ymd: string, hora: number): boolean {
    const ahoraBolivia = obtenerAhoraBolivia();
    const hoyYMD = aYMDDeCualquiera(ahoraBolivia);

    if (ymd !== hoyYMD) return false;

    const horaActual = ahoraBolivia.getHours();
    const minutoActual = ahoraBolivia.getMinutes();

    if (hora < horaActual) return true;
    if (hora === horaActual && minutoActual > 0) return true;

    return false;
}

export default function HorarioDelDia({
    fixerId,
    requesterId,
    selectedDate,
    onDateChange,
    pickerMode = false,
    onSlotSelect,
}: PropiedadesHorarioDia) {
    const { isFixer, isRequester } = useUserRole();
    const { isHourBooked, isDisabled, isCanceled, loading: contextLoading } = useAppointmentsContext();

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

    const handleDatePickerChange = (newDate: Date) => {
        const newDateStr = aYMDDeCualquiera(newDate);
        setFecha(newDateStr);
        onDateChange?.(newDate);
    };

    useEffect(() => {
        if (selectedDate) {
            const d = aYMDDeCualquiera(selectedDate as any);
            setFecha(d);
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

            const horas = rangoHorasEnteras(0, 23);

            // Si el día completo ya pasó, marcar todo como no disponible
            if (esPasadoYMD(d)) {
                const horarios: HorarioItem[] = horas.map((h) => ({
                    id_Horario: `${d}-${String(h).padStart(2, "0")}`,
                    Hora_Inicio: formatearHora(h),
                    estado_Horario: "no_disponible",
                }));
                if (myReq === refReqSeq.current) setDatos({ horarios });
                return;
            }

            const horarios: HorarioItem[] = [];
            for (const h of horas) {
                const horaMostrar = formatearHora(h);
                const idBase = `${d}-${String(h).padStart(2, "0")}`;

                // Si la hora ya pasó hoy, marcar como no disponible
                if (esHoraPasadaHoy(d, h)) {
                    horarios.push({ id_Horario: idBase, Hora_Inicio: horaMostrar, estado_Horario: "no_disponible" });
                    continue;
                }

                // Crear Date object para la hora actual
                const [year, month, day] = d.split("-").map(Number);
                const currentHourDate = new Date(year, month - 1, day, h, 0, 0);

                let estadoHora: Estado = "no_disponible"; // Default

                if (isFixer) {
                    // Lógica para FIXER
                    if (isHourBooked(currentHourDate, h)) {
                        estadoHora = "reservado";
                    } else if (isCanceled(currentHourDate, h, requesterId)) {
                        estadoHora = "cancelado_por_fixer";
                        console.log("huhuhu");
                    } else if (isDisabled(currentHourDate, h)) {
                        estadoHora = "disponible";
                    }
                } else if (isRequester) {
                    // Lógica para REQUESTER (usa las mismas funciones pero sin mostrar cancelados)
                    if (isHourBooked(currentHourDate, h)) {
                        estadoHora = "reservado";
                    } else if (isDisabled(currentHourDate, h)) {
                        estadoHora = "disponible";
                    }
                    // Si está cancelado, se queda como "no_disponible" (default)
                }

                horarios.push({ id_Horario: idBase, Hora_Inicio: horaMostrar, estado_Horario: estadoHora });
            }

            if (myReq === refReqSeq.current && !ac.signal.aborted) {
                setDatos({ horarios });
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
            case "disponible":
                return { text: "DISPONIBLE", icon: "＋", textCls: "text-emerald-600", rowCls: "bg-white" };
            case "reservado":
                return { text: "RESERVADO", icon: "✎", textCls: "text-amber-500", rowCls: "bg-white" };
            case "cancelado_por_fixer":
                return { text: "CANCELADO POR FIXER", icon: null, textCls: "text-white", rowCls: "bg-rose-600" };
            case "cancelado_por_requester":
                return { text: "CANCELADO POR REQUESTER", icon: null, textCls: "text-white", rowCls: "bg-rose-600" };
            case "no_disponible":
            default:
                return { text: "NO DISPONIBLE", icon: null, textCls: "text-slate-400", rowCls: "bg-white opacity-60" };
        }
    };

    const manejarClickEnSlot = (item: HorarioItem) => {
        // Determinar si el slot es clickeable según el rol
        let clickeable = false;

        if (isFixer) {
            // Para fixer: solo "reservado" es clickeable (para editar)
            clickeable = item.estado_Horario === "reservado";
        } else if (isRequester) {
            // Para requester: "disponible" y "reservado" son clickeables
            clickeable = item.estado_Horario === "disponible" || item.estado_Horario === "reservado";
        }

        if (!clickeable) return;

        const ymd = fecha || aYMDDeCualquiera(selectedDate || new Date());
        const baseDate = convertirYMDaFechaLocal(ymd);
        const hour = parseInt(item.Hora_Inicio.split(":")[0], 10);

        const slotDateLocal = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, 0, 0, 0);
        const iso = slotDateLocal.toISOString();

        if (pickerMode) {
            onSlotSelect?.(iso);
            return;
        }

        if (item.estado_Horario === "disponible") {
            refFormularioCita.current?.open(iso);
            return;
        }

        if (item.estado_Horario === "reservado") {
            cargarYEditarCita(item);
        }
    };

    const noHayHorariosDisponibles = !!datos && (datos.horarios ?? []).every((it) => it.estado_Horario !== "disponible");

    const esEstadoCancelado = (estado: Estado) =>
        estado === "cancelado_por_fixer" || estado === "cancelado_por_requester";

    return (
        <div className="mx-auto max-w-sm p-4 text-black">
            <h1 className="text-2xl font-semibold mb-3">
                Calendario de Diego Paredes
                <span className="text-xs ml-2 text-slate-500">
                    ({isFixer ? 'Vista Fixer' : 'Vista Requester'})
                </span>
            </h1>

            <div className="mb-3">
                <label className="block text-sm mb-1">Fecha</label>
                <DatePicker
                    selectedDate={selectedDate ? (typeof selectedDate === 'string' ? convertirYMDaFechaLocal(selectedDate) : selectedDate) : new Date()}
                    onDateChange={handleDatePickerChange}
                />
            </div>

            {(cargando || contextLoading) && (
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
                        {datos.horarios && (() => {
                            const horariosVisibles = pickerMode
                                ? datos.horarios.filter(h => h.estado_Horario === "disponible")
                                : datos.horarios;

                            return (
                                <div className="space-y-2">
                                    {horariosVisibles.map((item, idx) => {
                                        const meta = etiquetaPorEstado(item.estado_Horario);

                                        // Determinar clickeabilidad según rol
                                        let clickeable = false;
                                        if (isFixer) {
                                            clickeable = item.estado_Horario === "reservado";
                                        } else if (isRequester) {
                                            clickeable = item.estado_Horario === "disponible" || item.estado_Horario === "reservado";
                                        }

                                        return (
                                            <div
                                                key={item.id_Horario || `slot-${idx}`}
                                                onClick={() => {
                                                    if (!clickeable) return;
                                                    manejarClickEnSlot(item);
                                                }}
                                                className={`grid grid-cols-[64px_1fr_28px] items-center rounded-lg border px-3 py-2 shadow-sm ${meta.rowCls} ${clickeable ? "hover:brightness-95 cursor-pointer" : ""}`}
                                            >
                                                <div className={`font-semibold ${esEstadoCancelado(item.estado_Horario) ? "text-white bg-red-500" : "text-slate-800"}`}>
                                                    {item.Hora_Inicio}
                                                </div>
                                                <div className={`text-sm font-semibold ${meta.textCls}`}>{meta.text}</div>
                                                <div className={`text-xl text-right ${esEstadoCancelado(item.estado_Horario) ? "text-white" : "text-slate-500"}`}>
                                                    {meta.icon}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
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

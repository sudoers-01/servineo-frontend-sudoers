'use client';

import { useState, useRef } from "react";
import EditAppointmentForm, { EditAppointmentFormHandle, ExistingAppointment } from "@/components/appointments/forms/EditAppointmentForm";
import { useUserRole } from "@/utils/contexts/UserRoleContext";
import { DayOfWeek } from "@/hooks/useDailyAppointments";
import type { AppointmentFormHandle } from "@/components/appointments/forms/AppointmentForm";
import AppointmentForm from "@/components/appointments/forms/AppointmentForm";
import AppointmentDetailsForm, { EditAppointmentFormHandle as DetailsFormHandle } from "@/components/appointments/forms/AppointmentDetails";
import { useAppointmentsContext } from "@/utils/contexts/AppointmentsContext/AppoinmentsContext";
const API_BASE = "https://servineo-backend-lorem.onrender.com";

interface HourCellProps {
    date: Date;
    fixer_id: string;
    requester_id: string;
    hour: number;
    isPast: boolean;
    isToday: boolean;
    isHourBooked: (datei: Date, hour: number) => boolean;
    isDisabled: (datei: Date, hour: number) => boolean;
    view: 'day' | 'week';
}

const today = new Date();

export default function HourCell({
    hour,
    date,
    fixer_id,
    requester_id,
    isPast,
    isToday,
    view
}: HourCellProps) {
    const refFormularioCita = useRef<AppointmentFormHandle | null>(null);
    const formRef = useRef<DetailsFormHandle>(null);
    const refFormularioEditarCita = useRef<EditAppointmentFormHandle | null>(null);

    const { isHourBooked, isDisabled } = useAppointmentsContext();


    const isBooked = isHourBooked(date, hour);
    const isDisable = isDisabled(date, hour);

    const todayColor = () => {
        if (isToday && view === 'week') return "bg-blue-300";
        if (isToday && view === 'day' && today.getHours() === hour) return "bg-blue-300";
        else return "bg-white";
    }
    const { isFixer, isRequester } = useUserRole();

    const getColor = () => {
        if (isDisable) {
            return "bg-[#16A34A]"
        }
        if (isBooked) return "bg-[#FFC857]";
        else if (isRequester) {
            return "bg-[#64748B]"
        }
        return "bg-[#64748B]"
    }

    const getText = () => {
        if (isDisable)
            return "Disponible";


        if (isBooked) return "Ocupado";
        if (isFixer) {
            return ''
        } else if (isRequester) {
            return "Inhabilitado";
        }
    }

    const createISOWithOffset = (date: Date, hour: number) => {
        const fechaActual = new Date(date);
        const anio = fechaActual.getUTCFullYear();
        const mes = fechaActual.getUTCMonth();
        const dia = fechaActual.getUTCDate();
        const fechaFinal = new Date(Date.UTC(anio, mes, dia, hour + 4, 0, 0));
        return fechaFinal.toISOString();
    };


    const handleOpenForm = () => {
        if (formRef.current) {
            const now = new Date(date);
            now.setHours(hour, 0, 0, 0);
            formRef.current.open(now);
        }
    }

    // Función para cargar y editar cita (copiada de HorarioDelDia)
    async function cargarYEditarCita() {
        try {
            const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const isoParaEditar = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour + 4, 0, 0)).toISOString();

            const url =
                `${API_BASE}/api/crud_read/appointments/get_modal_form` +
                `?fixer_id=${encodeURIComponent(fixer_id)}` +
                `&requester_id=${encodeURIComponent(requester_id)}` +
                `&appointment_date=${encodeURIComponent(ymd)}` +
                `&start_hour=${encodeURIComponent(String(hour))}`;

            const res = await fetch(url, { headers: { Accept: "application/json" } });
            if (!res.ok) {
                const body = await res.text().catch(() => "<sin cuerpo>");
                alert(`Error ${res.status} al consultar la cita.\n${body}`);
                return;
            }
            const data = await res.json();

            const modality = data?.data?.appointment_type === "presential" ? "presencial" : "virtual";

            const existingAppointment: ExistingAppointment = {
                id: data?.data?._id || data?.data?.id || `${ymd}-${hour}`,
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
                fixerId: fixer_id,
                requesterId: requester_id,
            };

            refFormularioEditarCita.current?.open(existingAppointment);
        } catch (err) {
            alert("Error al cargar los datos de la cita para editar. Revisa consola.");
            console.error(err);
        }
    }

    const handleClick = () => {
        if (isRequester) {
            if (isBooked) {
                cargarYEditarCita();
            } else {
                const localISOString = createISOWithOffset(date, hour);
                refFormularioCita.current?.open(localISOString);
            }
        } else if (isFixer) {
            handleOpenForm();
        }
    }

    return (
        <div className={`flex items-center ${todayColor()} h-15 border-b border-r border-black`}>
            <div className="w-full">
                {!isPast && (
                    <div
                        className={`mx-3 py-3 rounded-md text-center text-white ${getColor()} cursor-pointer`}
                        onClick={handleClick}
                    >
                        <p>{getText()}</p>
                    </div>
                )}
            </div>

            <AppointmentForm
                ref={refFormularioCita}
                fixerId={fixer_id}
                requesterId={requester_id}
            />

            <EditAppointmentForm ref={refFormularioEditarCita} />

            <AppointmentDetailsForm ref={formRef} />
        </div>
    );
}

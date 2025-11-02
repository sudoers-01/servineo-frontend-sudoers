'use client';

import React from "react";
import { useState, useRef } from "react";
import EditAppointmentForm from "@/components/appointments/forms/EditAppointmentForm";
import type { EditAppointmentFormHandle, ExistingAppointment } from "@/components/appointments/forms/EditAppointmentForm";

import useAppointmentsByDate from "@/hooks/useDailyAppointments";
import type { AppointmentFormHandle } from "@/components/appointments/forms/AppointmentForm";
import AppointmentForm from "@/components/appointments/forms/AppointmentForm";
interface HourCellProps {
    date: Date;
    hour: number;
    isPast: boolean;
    isToday: boolean;
    fixer_id: string;
    requester_id: string;
    view: 'day' | 'week';
}

const today = new Date();

const API_BASE = "https://servineo-backend-lorem.onrender.com";
export default function HourCell({
    hour,
    date,
    isPast,
    isToday,
    fixer_id,
    requester_id,
    view


}: HourCellProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refFormularioEditarCita = useRef<EditAppointmentFormHandle | null>(null);
    const refFormularioCita = useRef<AppointmentFormHandle | null>(null);
    const {
        isHourBooked,
        getAppointmentByHour,

    } = useAppointmentsByDate(fixer_id, date);

    const isBooked = isHourBooked(hour);

    const todayColor = () => {
        if (isToday && view === 'week') return "bg-blue-300";
        if (isToday && view === 'day' && today.getHours() == hour) return "bg-blue-300";
        else return "bg-white";
    }
    const getColor = () => {
        if (isBooked) return "bg-[#FFC857]";
        else return "bg-[#16A34A]";
    }

    const getText = () => {
        if (isBooked) return "Ocupado";
        else return "Disponible";

    }
    const createISOWithOffset = (date: Date, hour: number) => {
        const appointmentDate = new Date(date);
        appointmentDate.setHours(hour, 0, 0, 0);
        // Construir ISO string manualmente sin conversión UTC
        const year = appointmentDate.getFullYear();
        const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
        const day = String(appointmentDate.getDate()).padStart(2, '0');
        const hourStr = String(hour).padStart(2, '0');
        const localISOString = `${year}-${month}-${day}T${hourStr}:00:00`;
        return localISOString;
    }
    const handleClick = () => {
        if (isBooked) {
            const appointment = getAppointmentByHour(hour);
            if (!appointment) {
                alert("No se encontró la cita");
                return;
            }

            // ⭐ Usar la misma lógica que el código que funciona
            const y = date.getFullYear();
            const m = date.getMonth() + 1;
            const d = date.getDate();
            const horaLocal = hour;
            const isoParaEditar = new Date(Date.UTC(y, m - 1, d, horaLocal + 4, 0, 0)).toISOString();

            const existingAppointment: ExistingAppointment = {
                id: appointment._id,

                datetime: isoParaEditar, // ⭐ Con UTC+4
                client: appointment.current_requester_name || "",
                contact: appointment.current_requester_phone || "",
                modality: appointment.appointment_type === "presential" ? "presencial" : "virtual",
                description: appointment.appointment_description || "",
                meetingLink: appointment.link_id || "",
                lat: appointment.lat ? Number(appointment.lat) : undefined,
                lon: appointment.lon ? Number(appointment.lon) : undefined,
                address: appointment.display_name_location || "",
                place: "",
            };

            refFormularioEditarCita.current?.open(existingAppointment);
        } else {
            // Para crear sigue usando tu función
            const isoParaCrear = createISOWithOffset(date, hour);
            refFormularioCita.current?.open(isoParaCrear);
        }
    }

    return (

        <div className={`flex items-center ${todayColor()} h-15 border-b border-r border-black`}>
            <div className="w-full" >
                {!isPast && <div
                    className={`mx-3 py-3 rounded-md text-center text-white ${getColor()} cursor-pointer`}
                    onClick={handleClick}

                >
                    <p>{getText()}</p>
                </div>}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-lg max-w-md w-full mx-4 text-black" >
                    </div>
                </div>

            )}

            <AppointmentForm ref={refFormularioCita} fixerId={fixer_id} requesterId={requester_id} />
            <EditAppointmentForm ref={refFormularioEditarCita} />
        </div >

    );


}

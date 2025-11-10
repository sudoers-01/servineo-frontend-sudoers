'use client';

import { useState, useRef } from "react";
import EditAppointmentForm, { EditAppointmentFormHandle, ExistingAppointment } from "@/components/appointments/forms/EditAppointmentForm";
import { useUserRole } from "@/utils/contexts/UserRoleContext";
import type { AppointmentFormHandle } from "@/components/appointments/forms/AppointmentForm";
import AppointmentForm from "@/components/appointments/forms/AppointmentForm";
import AppointmentDetailsForm, { EditAppointmentFormHandle as DetailsFormHandle } from "@/components/appointments/forms/AppointmentDetails";
import { useAppointmentsContext } from "@/utils/contexts/AppointmentsContext/AppoinmentsContext";
const API_BASE = "https://servineo-backend-lorem.onrender.com";

interface HourCellProps {
    date: Date;
    hour: number;
    isPast: boolean;
    isToday: boolean;
    view: 'day' | 'week';
}

type Estados = 'disponible' | 'noDisponible' | 'reservado' | 'inhabilitado' | 'ocupado' | 'reservadoOtro' | 'cancelFixer' | 'cancelRequester' | 'cancelOtherFixer' | 'cancelOtherRequester';
const today = new Date();

export default function HourCell({
    hour,
    date,
    isPast,
    isToday,
    view
}: HourCellProps) {
    const refFormularioCita = useRef<AppointmentFormHandle | null>(null);
    const formRef = useRef<DetailsFormHandle>(null);
    const refFormularioEditarCita = useRef<EditAppointmentFormHandle | null>(null);

    const { isHourBookedFixer, isHourBooked, isEnabled, isCanceled } = useAppointmentsContext();

    const { isFixer, isRequester, requester_id, fixer_id } = useUserRole();



    const isBookedFixer = isHourBookedFixer(date, hour);
    const isBooked = isHourBooked(date, hour, requester_id);
    const isEnable = isEnabled(date, hour);
    const isCancel = isCanceled(date, hour, requester_id);


    const todayColor = () => {
        if (isToday && view === 'week') return "bg-blue-300";
        if (isToday && view === 'day' && today.getHours() === hour) return "bg-blue-300";
        else return "bg-white";
    }


    //type Estados = 'disponible' | 'noDisponible' | 'reservado' | 'inhabilitado' | 'ocupado';
    // self 
    // other - otro erquester
    // notBooked  => no tiene nada a aesa hora 
    const getEstado = () => {
        if (isBooked) return 'reservado';
        if (isBookedFixer) return 'reservadoOtro';
        if (isEnable) {
            return 'disponible';
        } else {
            return 'inhabilitado';
        }

        if (isCancel === 'fixer') {
            return 'cancelFixer';
        } else if (isCancel === 'requester') {
            return 'cancelRequester';
        } else if (isCancel === 'otherFixer') {
            return 'cancelOtherFixer';
        } else if (isCancel === 'otherRequester')
            return 'cancelOtherRequester';

    }


    const getColor = (estado: Estados) => {

        if (isCancel !== 'notCancel') {
            return "bg-[#FF3E17]"
        }


        if (isBooked !== 'notBooked') {
            return "bg-[#FFC857]";

        }

        if (isEnable) {
            if (isRequester) {

                return "bg-[#16A34A]"
            } else {
                return "";
            }

        }

        return "bg-[#64748B]";
    }

    const getText = () => {




        if (isFixer) {
            if (isCancel === 'otherRequester' || isCancel === 'requester') {
                return "Cancelado por requester";
            } else if (isCancel === 'otherFixer' || isCancel === 'fixer') {
                return "Cancelado por fixer"
            }

            if (isBookedFixer) return "Reservado";

        } else { ///isRequester
            if (isCancel === 'fixer') {
                return "Cancelado por fixer"
            } else if (isCancel === 'requester') {
                return "Cancelado por requester";
            } else if (isCancel === 'otherRequester') return "Disponible";
            if (isBooked === 'other') {
                return "No disponible";

            }
            if (isBooked === 'self') {
                return 'Reservado';
            }
        }

        if (isEnable) {
            if (isRequester)
                return "Disponible"
        } else {
            return "Inhabilitado";
        }

        return "";
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
            if (isEnable) {
                if (isBooked === 'self' || isBooked === 'other') {
                    cargarYEditarCita();
                } else {
                    const localISOString = createISOWithOffset(date, hour);
                    refFormularioCita.current?.open(localISOString);
                }
            } else {
                //                console.log("no putito");
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

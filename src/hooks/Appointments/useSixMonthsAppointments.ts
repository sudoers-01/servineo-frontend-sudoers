import { useEffect, useState, useRef, useCallback } from "react";
import { Appointment } from '@/utils/getAppointmentsByDate';
import { getSixMonthAppointments } from "@/utils/Appointments/getSixMonthAppointments";

import { getAppointmentsDisable, Days } from "@/utils/getAppointmentsDisable";

export type DayOfWeek = keyof Days;
const DAY_MAP: { [key: number]: DayOfWeek } = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado'
};







export default function useSixMonthsAppointments(fixer_id: string, date: Date) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentsDis, setAppointmentsDis] = useState<Days>({
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
        sabado: [],
        domingo: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hasFetched = useRef(false);
    useEffect(() => {
        if (hasFetched.current) {
            return;
        }

        async function fetchData() {
            if (!fixer_id || fixer_id === '' || fixer_id === 'undefined') {
                console.warn('fixer_id no válido:', fixer_id);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [appointmentsData, availabilityData] = await Promise.all([
                    getSixMonthAppointments(fixer_id, date.toISOString().split('T')[0]),
                    getAppointmentsDisable(fixer_id)
                ]);

                setAppointments(appointmentsData);
                setAppointmentsDis(availabilityData);
                setError(null);
                hasFetched.current = true;
            } catch (err) {
                setError('Error al cargar los datos');
                console.error('Error en fetchData:', err);
                setAppointments([]);
                setAppointmentsDis({
                    lunes: [],
                    martes: [],
                    miercoles: [],
                    jueves: [],
                    viernes: [],
                    sabado: [],
                    domingo: []
                });
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [fixer_id, date]);




    const isHourBookedFixer = useCallback((day: Date, hour: number): boolean => {
        return appointments.some((apt: Appointment) => {
            const aptDate = new Date(apt.starting_time);
            const aptState = apt.schedule_state;
            return (
                aptDate.getFullYear() === day.getFullYear() &&
                aptDate.getMonth() === day.getMonth() &&
                aptDate.getDate() === day.getDate() &&
                aptDate.getUTCHours() === hour &&
                aptState === 'booked'
            );
        });
    }, [appointments]);



    const isHourBooked = useCallback((day: Date, hour: number, requester_id: string): 'self' | 'other' | 'notBooked' => {
        const appointment = appointments.find((apt: Appointment) => {
            const aptDate = new Date(apt.starting_time);
            const aptState = apt.schedule_state;
            return (
                aptDate.getFullYear() === day.getFullYear() &&
                aptDate.getMonth() === day.getMonth() &&
                aptDate.getDate() === day.getDate() &&
                aptDate.getUTCHours() === hour &&
                aptState === 'booked'
            );
        });

        if (!appointment)
            return 'notBooked';
        if (appointment.id_requester === requester_id)
            return 'self';
        return 'other';
    }, [appointments]);



    const isEnabled = useCallback((day: Date, hour: number): boolean => {
        const dayOfWeek = day.getDay();
        const dayName = DAY_MAP[dayOfWeek];

        if (!appointmentsDis || !appointmentsDis[dayName]) {
            return false;
        }

        return appointmentsDis[dayName].includes(hour);
    }, [appointmentsDis]);


    const isCanceled = useCallback((day: Date, hour: number, requester_id: string): boolean => {
        const appointment = appointments.find((apt: Appointment) => {
            const aptDate = new Date(apt.starting_time);
            const aptReq = apt.id_requester;
            const aptCancel = apt.cancelled_fixer;
            return (
                aptDate.getFullYear() === day.getFullYear() &&
                aptDate.getMonth() === day.getMonth() &&
                aptDate.getDate() === day.getDate() &&
                aptDate.getUTCHours() === hour && aptReq === requester_id && aptCancel
            );
        });

        return false;
    }, [appointments]);

    return {
        isHourBookedFixer,
        isHourBooked,
        isEnabled,
        loading,
        isCanceled,
        error
    };
}

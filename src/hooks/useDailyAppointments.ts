import { useEffect, useState } from "react";
import { getAppointmentsByDate, Appointment } from '@/utils/getAppointmentsByDate';
import { getAppointmentsDisable, Days } from "@/utils/getAppointmentsDisable";

export type DayOfWeek = keyof Days;

export default function useAppointmentsByDate(fixer_id: string, date: Date) {
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

    useEffect(() => {
        async function fetchData() {
            if (!fixer_id || fixer_id === '' || fixer_id === 'undefined') {
                console.warn('fixer_id no válido:', fixer_id);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const [appointmentsData, availabilityData] = await Promise.all([
                    getAppointmentsByDate(fixer_id, date.toISOString().split('T')[0]),
                    getAppointmentsDisable(fixer_id)
                ]);

                setAppointments(appointmentsData);
                setAppointmentsDis(availabilityData);
                setError(null);
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

    const getAppointmentByHour = (hour: number) => {
        return appointments.find(apt => new Date(apt.starting_time).getUTCHours() === hour);
    };

    const bookedHours = appointments.map(apt =>
        new Date(apt.starting_time).getUTCHours(),
    );

    const isHourBooked = (hour: number): boolean => {
        return bookedHours.includes(hour);
    }

    const isDisabled = (hour: number, day: DayOfWeek): boolean => {
        if (!appointmentsDis || !appointmentsDis[day]) {
            return false;
        }
        return appointmentsDis[day].includes(hour);
    }

    return {
        bookedHours,
        getAppointmentByHour,
        isHourBooked,
        loading,
        error,
        isDisabled
    };
}

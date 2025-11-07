import { useEffect, useState, useRef } from "react";
import { getAppointmentsByDate, Appointment } from '@/utils/getAppointmentsByDate';
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

interface CacheData {
    endDate: Date;
    appointments: Appointment[];
    appointmentsDis: Days;
}



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

    //Para el cache, cachai??
    const cacheRef = useRef<CacheData | null>(null);


    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    useEffect(() => {
        async function fetchData() {
            if (!fixer_id || fixer_id === '' || fixer_id === 'undefined') {
                console.warn('fixer_id no valido:', fixer_id);
                setLoading(false);
                return;
            }



            if (cacheRef.current) {
                const cached = cacheRef.current;
                const isSameRange =
                    cached.endDate.getMonth() === date.getMonth() &&
                    cached.endDate.getFullYear() === date.getFullYear();

                if (isSameRange) {
                    console.log("Ya esta cachai?");
                    setAppointments(cached.appointments);
                    setAppointmentsDis(cached.appointmentsDis);
                    setLoading(false);
                    return;
                }

            }


            setLoading(true);

            try {

                const monthDates: string[] = [];

                for (let i = 0; i <= daysInMonth; i++) {
                    monthDates.push(new Date(date.getFullYear(), date.getMonth(), i).toISOString().split('T')[0]);
                }


                const [availabilityData, ...appointmentsDataArray] = await Promise.all([
                    getAppointmentsDisable(fixer_id),
                    ...monthDates.map((date: string) => getAppointmentsByDate(fixer_id, date))
                ]);

                const allAppointments = appointmentsDataArray.flat();

                setAppointments(allAppointments);
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

    const isHourBooked = (day: Date, hour: number): boolean => {
        return appointments.some((apt: Appointment) => {
            const aptDate = new Date(apt.starting_time);
            return (
                aptDate.getFullYear() === day.getFullYear() &&
                aptDate.getMonth() === day.getMonth() &&
                aptDate.getDate() === day.getDate() &&
                aptDate.getUTCHours() === hour
            );
        });
    };

    const isDisabled = (day: Date, hour: number): boolean => {
        const dayOfWeek = day.getDay();
        const dayName = DAY_MAP[dayOfWeek];

        if (!appointmentsDis || !appointmentsDis[dayName]) {
            return false;
        }

        return appointmentsDis[dayName].includes(hour);

    }

    return {
        isHourBooked,
        isDisabled,
        loading,
        error
    };
}

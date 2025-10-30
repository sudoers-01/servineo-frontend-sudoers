import { useEffect, useState } from "react";
import { getAppointmentsByDate, Appointment } from '@/utils/getAppointmentsByDate';


export default function useAppointmentsByDate(fixer_id: string, date: Date) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        async function fetchAppointments() {
            try {
                const data = await getAppointmentsByDate(fixer_id, date.toISOString().split('T')[0]);
                setLoading(true);
                setAppointments(data);
            } catch (err) {
                setError('Error al cargar las citas');
                console.error(err);
            }
        }
        fetchAppointments();
    }, [fixer_id, date]);



    const bookedHours = appointments.map(apt => new Date(apt.starting_time).getUTCHours());

    const isHourBooked = (hour: number) => bookedHours.includes(hour);


    return {
        bookedHours,
        isHourBooked,
        loading
    };
}

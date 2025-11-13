import { getSchedulesCont } from "@/utils/getSchedulesCont";
import { useState, useEffect } from "react";

interface useDayUtilitiesProps {
    date: Date;
    fixer_id: string;
}

export default function useDayUtilities({
    date,
    fixer_id,
}: useDayUtilitiesProps) {

    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSchedulesCont(
                    fixer_id,
                    date.toISOString().split('T')[0]
                );
                setCount(result);
            } catch {
                setCount(0);
            }
        };
        fetchData();
    }, [date, fixer_id]);

    const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = normalize(new Date());
    const currentDate = normalize(date);


    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    const isToday = isSameDay(currentDate, today);
    const isPast = currentDate < today;

    const getColor = () => {
        if (isPast) return 'text-black';
        if (count === 0) return 'bg-[#16A34A] ';
        if (count >= 1 && count <= 23) return 'bg-[#FFC857]';
        if (count === 24) return 'bg-[#FF5F57] ';
        return 'bg-gray-200 text-black';
    };

    const getText = () => {
        if (isPast) return '';
        if (count === 0) return 'Disponible';
        if (count >= 1 && count <= 23) return 'Parc. Oc.';
        if (count === 24) return 'Ocupado';
        return '';
    };
    return { count, isPast, isSameDay, isToday, getColor, getText };
}

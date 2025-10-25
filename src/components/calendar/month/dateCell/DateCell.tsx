
'use client';
import { getSchedulesCont } from '@/utils/getSchedulesCont';
import React, { useEffect, useState } from 'react';

interface DateCellProps {
    date: Date | string; // aceptar ambos tipos
    fixer_id: string;
}

export default function DateCell({ date, fixer_id }: DateCellProps) {
    // si la fecha no es válida, mostrar algo neutro
    const dateObj = new Date(date);
    if (!date || isNaN(dateObj.getTime())) {
        return <div className="p-2 text-xs text-gray-400">—</div>;
    }

    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSchedulesCont(
                    fixer_id,
                    dateObj.toISOString().split('T')[0]
                );
                setCount(result);
            } catch {
                setCount(0);
            }
        };
        fetchData();
    }, [dateObj, fixer_id]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    const isToday = isSameDay(dateObj, today);
    const isWeekend = dateObj.getDay() === 6 || dateObj.getDay() === 0;
    const isPast = dateObj < today;

    const getColor = () => {
        if (isPast) return '';
        if (isWeekend) return 'bg-[#9FA1A5]';
        if (count === 0) return 'bg-[#16A34A] ';
        if (count >= 1 && count <= 7) return 'bg-[#FFC857]';
        if (count >= 8) return 'bg-[#FF5F57] ';
        return 'bg-gray-200 text-black';
    };

    const getText = () => {
        if (isPast) return '';
        if (isWeekend) return 'No disponible';
        if (count === 0) return 'Disponible';
        if (count >= 1 && count <= 7) return 'Reservado';
        if (count >= 8) return 'No disponible';
        return '';
    };

    return (
        <div className={`p-2 rounded-full text-center text-white ${getColor()}`}>
            <p>{getText()}</p>
        </div>
    );
}

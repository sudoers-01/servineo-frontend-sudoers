'use client';
import axios from 'axios';
import { getSchedulesCont } from '@/utils/getSchedulesCont';
import React, { useEffect, useState } from 'react';
interface DateCellProps {
    date: Date;
    fixer_id: string;
}

export default function DateCell({
    date,
    fixer_id
}: DateCellProps) {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSchedulesCont(
                    fixer_id,
                    date.toISOString().split('T')[0]
                );
                setCount(result);
            } catch (err) {
                setCount(0);
            }
        };
        fetchData();
    }, [date, fixer_id]);
    const today = new Date();

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    const isToday = isSameDay(date, today);

    const isWeekend = date.getDay() == 6 || date.getDay() == 0;
    const isPast = date < today && !isToday;


    const getColor = () => {
        if (isPast) return 'text-black';
        if (isWeekend) return ' bg-[#9FA1A5]'
        if (count === null) return 'bg-[#16A34A]';
        if (count === 0) return 'bg-[#16A34A]';
        if (count >= 1 && count <= 7) return 'bg-[#FFC857]';
        if (count >= 8) return 'bg-[#FF5F57]';

    }
    const getText = () => {
        if (isPast) return '';
        if (isWeekend) return 'No disponible'
        if (count === 0) return 'Disponible';
        if (count >= 1 && count <= 7) return 'Reservado';
        if (count >= 8) return 'No disponible';

    }

    return (
        < div className={`p-2  text-white rounded-full text-center ${getColor()}`
        } >
            <p>{getText()}</p>
        </div >
    )


};

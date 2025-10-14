
'use client';

import { getSchedulesCounter } from '@/utils/getSchedulesCounter';
import React, { useEffect, useState } from 'react';
interface DayCellProps {
    date: Date;
    today: Date;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
}

export default function DayCell({
    date,
    today,
    selectedDate,
    onSelectDate,
}: DayCellProps) {
    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();
    const isToday = isSameDay(date, today);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const [count, setCount] = useState<number | null>(null);


    const dayNumber = date.getDate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSchedulesCounter(
                    'uuid-fixer-1234',
                    'uuid-user-4567',
                    date.toISOString().split('T')[0]
                );
                setCount(result);
            } catch (err) {
                console.error('Error fetching schedules:', err);
                setCount(0);
            }
        };
        fetchData();
    }, [date]);



    const isPast = date < today && !isToday;


    const getColor = () => {
        if (isSelected) return 'bg-blue-500 text-white';
        if (isPast) return 'text-black';
        if (count === null) return 'bg-[#16A34A] ';
        if (count === 0) return 'bg-[#16A34A]';
        if (count == 1) return 'bg-[#FFC857]';
        if (count == 2) return 'bg-[#FF5F57]';

    }
    const todayRing = isToday ? 'ring-2 ring-blue-600 ring-offset-2' : '';
    return (
        <button
            onClick={() => onSelectDate(date)}
            className={`
        relative flex items-center justify-center w-10 h-10 mx-auto rounded-full 
        transition-all duration-200 select-none font-medium
        ${getColor()} ${todayRing}
      `}
        >
            <span>{dayNumber}</span>

        </button>
    );
};


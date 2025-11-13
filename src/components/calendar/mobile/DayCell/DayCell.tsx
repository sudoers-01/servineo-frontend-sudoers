
'use client';

import React from 'react';
import useDayUtilities from '@/hooks/useDayUtilities';

interface DayCellProps {
    date: Date;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    isDisabled: boolean;
    cont: number;
}

export default function DayCell({
    date,
    selectedDate,
    onSelectDate,
    isDisabled,
    cont
}: DayCellProps) {
    const dayNumber = date.getDate();
    const {
        isToday,
        isPast,
        isSameDay,
        getColor
    } = useDayUtilities(
        date
    );


    const isSelected = isSameDay(date, selectedDate);

    const todayRing = isToday ? 'ring-2 ring-blue-600 ring-offset-2' : '';
    return (
        <button
            onClick={() => onSelectDate(date)}
            className={`
        relative flex items-center justify-center w-10 h-10 mx-auto rounded-full 
        select-none font-medium cursor-pointer 
        ${isSelected ? "bg-blue-500" : getColor(cont)} ${todayRing} `}
        >
            <span>{dayNumber}</span>

        </button>
    );
};


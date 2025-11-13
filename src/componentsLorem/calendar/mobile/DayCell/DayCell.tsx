'use client';

import React from 'react';
import useDayUtilities from '@/hooks/useDayUtilities';


const today = new Date();

interface DayCellProps {
    date: Date;
    selectedDate: Date;

    onSelectDate: (date: Date) => void;
    color: number
}

export default function DayCell({
    date,
    selectedDate,
    onSelectDate,
    color
}: DayCellProps) {
    const dayNumber = date.getDate();
    const { isSameDay } = useDayUtilities(date);

    const {
        isToday,
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
        ${isSelected ? "bg-blue-500" : getColor(color)} ${todayRing}`}
        >
            <span>{dayNumber}</span>

        </button>
    );
};

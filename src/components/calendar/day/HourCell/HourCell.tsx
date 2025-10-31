'use client';

import React from "react";

interface HourCellProps {
    isBooked: boolean;
    isPast: boolean;
    isToday: boolean;
    view: 'day' | 'week';
}

export default function HourCell({
    isBooked,
    isPast,
    isToday,
    view


}: HourCellProps) {

    const todayColor = () => {
        if (isToday && view === 'week') return "bg-blue-300";
        else return "bg-white";
    }
    const getColor = () => {
        if (isBooked) return "bg-[#FFC857]";
        else return "bg-[#16A34A]";
    }

    const getText = () => {
        if (isBooked) return "Ocupado";
        else return "Disponible";

    }

    return (

        <div className={`flex items-center ${todayColor()} h-15 border-b border-r border-black`}>
            <div className="w-full" >
                {!isPast && <div className={`mx-3 py-3 rounded-md text-center text-white ${getColor()} cursor-pointer`}>
                    <p>{getText()}</p>
                </div>}
            </div>

        </div>

    );

}

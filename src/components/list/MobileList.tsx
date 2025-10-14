'use client';

import React, { useEffect, useState } from "react";


interface MobileListProps {
    selectedDate: Date | null;
}


export default function MobileList({
    selectedDate,
}: MobileListProps) {
    const today = selectedDate;
    const [type, setType] = useState<'day' | 'week'>('day');



    return (
        <div className="flex bg-gray-200 rounded-full p-1 w-fit mx-auto cursor-pointer">
            <button
                onClick={() => setType('day')}
                className={`px-4 py-1 rounded-full text-base font-semibold transition-colors duration-200 ${type === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                    }`}
            >
                Horario del día
            </button>

            <button
                onClick={() => setType('week')}
                className={`px-4 py-1 rounded-full text-base font-semibold transition-colors duration-200 ${type === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                    }`}
            >
                Horario de la semana
            </button>
        </div>


    )
}

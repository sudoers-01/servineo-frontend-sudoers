'use client';

import React from "react";
import { useState } from "react";


interface HourCellProps {
    hour: number;
    isBooked: boolean;
    isPast: boolean;
    isToday: boolean;
    view: 'day' | 'week';
}

const today = new Date();

export default function HourCell({
    hour,
    isBooked,
    isPast,
    isToday,
    view


}: HourCellProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);



    const todayColor = () => {
        if (isToday && view === 'week') return "bg-blue-300";
        if (isToday && view === 'day' && today.getHours() == hour) return "bg-blue-300";
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


    const handleClick = () => {
        if (!isPast) {
            setIsModalOpen(true);
        }
    }

    return (

        <div className={`flex items-center ${todayColor()} h-15 border-b border-r border-black`}>
            <div className="w-full" >
                {!isPast && <div
                    className={`mx-3 py-3 rounded-md text-center text-white ${getColor()} cursor-pointer`}
                    onClick={handleClick}

                >
                    <p>{getText()}</p>
                </div>}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-lg max-w-md w-full mx-4 text-black" onClick={(e) => e.stopPropagation()}>
                        {isBooked ? (
                            <p>Lo del Pichon</p>
                        ) : (
                            <p>Lo de Vale</p>
                        )}
                    </div>
                </div>

            )}
        </div >

    );

}

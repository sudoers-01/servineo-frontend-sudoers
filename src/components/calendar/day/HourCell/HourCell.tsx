'use client';

import React from "react";

interface HourCellProps {
    isBooked: boolean;
}

export default function HourCell({
    isBooked,
}: HourCellProps) {


    const getColor = () => {
        if (isBooked) return "bg-[#FFC857]";
        else return "bg-[#16A34A]";
    }

    const getText = () => {
        if (isBooked) return "Ocupado";
        else return "Disponible";

    }

    return (

        <div className="flex items-center bg-white h-15 border-b border-r border-black">
            <div className="w-full" >
                <div className={`mx-3 py-3 rounded-md text-center text-white ${getColor()} cursor-pointer`}>
                    <p>{getText()}</p>
                </div>
            </div>

        </div>

    );

}

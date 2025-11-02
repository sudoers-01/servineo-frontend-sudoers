'use client';
import React from "react";
export default function Hours() {
    const hours = Array.from({ length: 23 }, (_, i) => i);

    return (
        <div className="w-20 flex-shrink-0 bg-[#D9D9D9] border-b border-black ">
            {hours.map(hour => (
                <div
                    key={`hour-${hour}`}
                    className="h-15 flex items-center px-3 text-black font-medium border-x">
                    {hour}:00
                </div>
            ))}
        </div>
    );
}

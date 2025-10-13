'use client';
import React from "react";

interface MobileHeaderProps {
    year: number;
    month: number;
    onChangeMonth: (newMonth: number) => void;
    onChangeYear: (newYear: number) => void;
}

const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function MobileHeader({
    year,
    month,
    onChangeMonth,
    onChangeYear,
}: MobileHeaderProps) {

    const handlePrevMonth = () => {
        if (month === 0) {
            onChangeMonth(11);
            onChangeYear(year - 1);
        } else {
            onChangeMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 11) {
            onChangeMonth(0);
            onChangeYear(year + 1);
        } else {
            onChangeMonth(month + 1);
        }
    };

    return (
        <div className="flex justify-between items-center mb-4 px-2">
            {/* Selector de mes */}
            <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-200 transition-colors">&lt;</button>
                <span className="text-lg font-semibold">{monthNames[month]}</span>
                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-200 transition-colors">&gt;</button>
            </div>

            {/* Selector de año */}
            <div className="flex items-center gap-2">
                <button onClick={() => onChangeYear(year - 1)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">&lt;</button>
                <span className="text-lg font-semibold">{year}</span>
                <button onClick={() => onChangeYear(year + 1)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">&gt;</button>
            </div>
        </div>
    );
}

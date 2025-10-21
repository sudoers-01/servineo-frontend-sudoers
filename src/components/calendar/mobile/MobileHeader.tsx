
'use client';
import React, { useState, useEffect } from "react";

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
    year: initialYear,
    month: initialMonth,
    onChangeMonth,
    onChangeYear,
}: MobileHeaderProps) {
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);

    useEffect(() => {
        setYear(initialYear);
        setMonth(initialMonth);
    }, [initialYear, initialMonth]);

    const handlePrevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(prev => prev - 1);
            onChangeMonth(11);
            onChangeYear(year - 1);
        } else {
            setMonth(prev => prev - 1);
            onChangeMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        const currentDate = new Date();
        const nextDate = new Date(year, month + 1, 1);

        const diffMonths =
            (nextDate.getFullYear() - currentDate.getFullYear()) * 12 +
            (nextDate.getMonth() - currentDate.getMonth());

        if (diffMonths > 6) return;

        if (month === 11) {
            setMonth(0);
            setYear(prev => prev + 1);
            onChangeMonth(0);
            onChangeYear(year + 1);
        } else {
            setMonth(prev => prev + 1);
            onChangeMonth(month + 1);
        }
    };

    const isNextDisabled = (() => {
        const currentDate = new Date();
        const nextDate = new Date(year, month + 1, 1);
        const diffMonths =
            (nextDate.getFullYear() - currentDate.getFullYear()) * 12 +
            (nextDate.getMonth() - currentDate.getMonth());
        return diffMonths > 6;
    })();

    return (
        <div className="text-black flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-2">
                {/* Botón mes anterior */}
                <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-full hover:bg-gray-200 active:bg-gray-400 transition-colors"
                >
                    &lt;
                </button>

                <span className="text-lg font-semibold">{monthNames[month]}</span>

                <button
                    onClick={handleNextMonth}
                    disabled={isNextDisabled}
                    className={`p-1 rounded-full transition-colors ${isNextDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-gray-200 active:bg-gray-400"
                        }`}
                >
                    &gt;
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{year}</span>
            </div>
        </div >
    );
}

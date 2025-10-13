'use client';
import React from "react";

interface Event {
    title: string;
    date: Date;
}

interface MobileMonthViewProps {
    year: number;
    month: number; // 0 = enero
    events?: Event[];
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
}

export default function MobileMonthView({
    year,
    month,
    events = [],
    selectedDate,
    onSelectDate,
}: MobileMonthViewProps) {
    const today = new Date();

    // Función para comparar días
    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    // Número de días del mes
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Ajuste: lunes = 0
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    const days: React.ReactNode[] = [];

    // Agregar huecos antes del primer día
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    // Agregar los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const hasEvent = events.some((e) => isSameDay(e.date, date));
        const isToday = isSameDay(date, today);
        const isSelected = selectedDate && isSameDay(date, selectedDate);

        days.push(
            <button
                key={day}
                onClick={() => onSelectDate(date)}
                className={`
          relative flex items-center justify-center w-10 h-10 mx-auto rounded-full
          transition-all duration-200 select-none
          ${isSelected
                        ? 'bg-blue-500 text-white'
                        : isToday
                            ? 'border-2 border-blue-400 text-blue-500'
                            : 'text-gray-800 hover:bg-blue-100'
                    }
        `}
            >
                {day}
                {hasEvent && (
                    <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                )}
            </button>
        );
    }

    return (
        <div className="p-4">
            {/* Encabezado de días (lunes = primer día) */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 mb-2">
                <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
            </div>

            {/* Grilla de fechas */}
            <div className="grid grid-cols-7 gap-y-4">
                {days}
            </div>
        </div>
    );
}

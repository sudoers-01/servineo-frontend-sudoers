
'use client';
import React, { useState } from "react";
import MobileHeader from "./MobileHeader";
import MobileMonthView from "./MobileMonthView";


interface MobileCalendarProps {
    fixer_id: string;
    selectedDate: Date | null;
    onSelectDate: (dato: Date) => void;
}
export default function MobileCalendar({
    fixer_id,
    selectedDate,
    onSelectDate,
}: MobileCalendarProps) {
    const today = selectedDate || new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [message, setMessage] = useState("");

    const handleSelectedClick = () => {
        if (selectedDate) {
            setMessage(`La fecha seleccionada es: ${selectedDate.toLocaleDateString()}`);
        }
    }



    return (
        <div className="bg-white rounded-2xl shadow p-4 max-w-md mx-auto">
            <MobileHeader
                month={today.getMonth()}
                year={today.getFullYear()}
                onChangeMonth={setMonth}
                onChangeYear={setYear}
            />

            <MobileMonthView
                year={year}
                month={month}
                fixer_id={fixer_id}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
            />

            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSelectedClick}
                    className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-2xl
               active:bg-gray-500 transition-colors"
                >
                    Seleccionar
                </button>
            </div>

            {message && (
                <div className="mt-2 text-gray-700 font-medium text-center">
                    {message}
                </div>
            )}

        </div>
    );
}

'use client';
import React from "react";

import HourCell from "./HourCell/HourCell";

import useAppointmentsByDate from "@/hooks/useDailyAppointments";


interface DesktopDailyViewProps {

    date: Date;
    fixer_id: string;
    view: 'week' | 'day';
}

const today = new Date();
const currentHour = today.getHours();
console.log(currentHour);



export default function DesktopDailyHours({
    date,
    fixer_id,
    view
}: DesktopDailyViewProps) {
    const {
        isHourBooked,
    } = useAppointmentsByDate(fixer_id, date);
    const isPast = (hour: number) => {
        return hour < currentHour && date <= today;
    }
    const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();



    const hours = Array.from({ length: 10 }, (_, i) => i + 8);

    return (
        <div className="flex-1 grid grid-rows-9">
            {hours.map(hour => (
                <HourCell
                    key={hour}
                    isBooked={isHourBooked(hour)}
                    isPast={isPast(hour)}
                    isToday={isToday}
                    view={view}
                />
            ))}
        </div>
    );

}

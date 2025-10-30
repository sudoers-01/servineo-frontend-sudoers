'use client';
import React from "react";

import HourCell from "./HourCell/HourCell";

import useAppointmentsByDate from "@/hooks/useDailyAppointments";


interface DesktopDailyViewProps {

    date: Date;
    fixer_id: string;

}



export default function DesktopDailyHours({
    date,
    fixer_id
}: DesktopDailyViewProps) {
    const {
        isHourBooked,
        //        loading
    } = useAppointmentsByDate(fixer_id, date);


    const hours = Array.from({ length: 10 }, (_, i) => i + 8);

    return (
        <div className="flex-1 grid grid-rows-9">
            {hours.map(hour => (
                <HourCell
                    key={hour}
                    isBooked={isHourBooked(hour)}
                />
            ))}
        </div>
    );

}

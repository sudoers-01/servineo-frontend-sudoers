'use client';
import React from "react";

import HourCell from "./HourCell/HourCell";

import { useUserRole } from "@/utils/contexts/UserRoleContext";

import { useAppointmentsContext } from "@/utils/contexts/AppointmentsContext/AppoinmentsContext";

interface DesktopDailyViewProps {

    date: Date;
    view: 'week' | 'day';
}

const today = new Date();
const currentHour = today.getHours();

export default function DesktopDailyHours({
    date,
    view
}: DesktopDailyViewProps) {
    const {
        fixer_id,
        requester_id
    } = useUserRole();
    const {
        isHourBooked,
        isDisabled
    } = useAppointmentsContext();






    const isPast = (hour: number) => {
        if (date.getFullYear() < today.getFullYear() ||
            date.getMonth() < today.getMonth() ||
            date.getDate() < today.getDate()) {
            return true;
        }

        if (isToday) {
            return hour < currentHour;
        }

        return false;
    }
    const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();



    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="flex-1 grid grid-rows-23">
            {hours.map(hour => (
                <HourCell
                    key={hour}
                    date={date}
                    fixer_id={fixer_id}
                    requester_id={requester_id}
                    hour={hour}
                    isPast={isPast(hour)}
                    isToday={isToday}
                    isHourBooked={isHourBooked}
                    isDisabled={isDisabled}
                    view={view}
                />
            ))}
        </div>
    );

}

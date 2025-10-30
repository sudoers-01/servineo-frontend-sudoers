
"use client";

import { useState, useEffect } from "react";
import DesktopCalendar from "@/components/calendar/DesktopCalendar";

import MobileCalendar from "@/components/calendar/mobile/MobileCalendar";
import MobileList from "@/components/list/MobileList";


const fixer_id = "user_fixer_1234";
export default function CalendarPage() {


    const [requesterId, setRequesterId] = useState("user_requester_5678");

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const today = new Date();

    const handleDataChange = (newDate: Date) => {
        setSelectedDate(newDate);
    }

    return (
        <div className="flex flex-col bg-white min-h-screen">

            <div className="flex justify-center md:block hidden">
                <DesktopCalendar
                    fixer_id={fixer_id}
                    requester_id={"ungu"}
                />

            </div>

            <div className="flex flex-col md:hidden justify-center gap-4" >
                <MobileCalendar
                    fixer_id={fixer_id}
                    selectedDate={selectedDate}
                    onSelectDate={handleDataChange}

                />
                <div></div>
                <MobileList
                    selectedDate={selectedDate}
                    fixerId={fixer_id}
                    requesterId={requesterId}
                    onDateChange={handleDataChange}
                />
            </div>
        </div>
    );
}

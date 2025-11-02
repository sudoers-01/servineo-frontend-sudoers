
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import DesktopCalendar from "@/components/calendar/DesktopCalendar";

import MobileCalendar from "@/components/calendar/mobile/MobileCalendar";
import MobileList from "@/components/list/MobileList";


const fixer_id = "user_fixer_1234";
export default function CalendarPage() {

    const router = useRouter();

    const [requesterId, setRequesterId] = useState("user_requester_5678");

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const today = new Date();

    const handleDataChange = (newDate: Date) => {
        setSelectedDate(newDate);
    }

    return (

        <div className="flex flex-col bg-white min-h-screen">

            <div className="flex items-center">
                <button
                    onClick={() => router.back()}
                    className="p-2 m-4 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors self-start">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6l12 12M6 18L18 6"
                            strokeWidth={2}
                        />
                    </svg>
                </button>
                <h2 className="text-black p-4 text-2xl text-center">Calendario Diego Paredes</h2>
            </div>

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

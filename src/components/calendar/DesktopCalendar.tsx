
'use client';
import { useState } from "react";
import DesktopMonthView from "@/components/calendar/month/DesktopMonthView/DesktopMonthView";
import HeaderDesktop from "@/components/calendar/Header/HeaderDesktop";

import useCalendarView from "@/hooks/useCalendarView";
import DesktopDailyView from "./day/DesktopDailyView";
import DesktopWeekView from "./week/DesktopWeekView";

interface DesktopCalendarProps {
    fixer_id: string;
    requester_id: string;
}


export default function DesktopCalendar({
    fixer_id,
    requester_id
}: DesktopCalendarProps) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());
    const [day, setDay] = useState(date.getDate());
    const {
        view,
        handleMonthView,
        handleWeekView,
        handleDayView
    } = useCalendarView();


    const selectedDate = new Date(year, month, day);
    return (
        <div className="w-full flex flex-col items-center bg-white">
            <div className="w-full max-w-5xl">
                <div className="bg-green-500 w-full p-1 flex items-center">
                    <HeaderDesktop
                        year={year}
                        month={month}
                        day={day}
                        onChangeMonth={setMonth}
                        onChangeYear={setYear}
                        onChangeDate={setDay}
                        view={view}
                        onViewChange={{ handleMonthView, handleWeekView, handleDayView }}
                    />
                </div>

                <div className=" w-full  justify-center">
                    {view === 'month' && <DesktopMonthView
                        year={year}
                        month={month}
                        fixer_id={fixer_id}
                        requester_id={requester_id}
                    />}

                    {view === 'week' && <DesktopWeekView
                        date={selectedDate}
                        fixer_id={fixer_id}
                    />}

                    {view === 'day' && <DesktopDailyView
                        date={selectedDate}
                        fixer_id={fixer_id}
                    />}
                </div>
            </div>
        </div>
    );
}

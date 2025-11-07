
'use client';
import { useState, useMemo } from "react";
import DesktopMonthView from "@/components/calendar/month/DesktopMonthView/DesktopMonthView";
import HeaderDesktop from "@/components/calendar/Header/HeaderDesktop";
import useAppointmentsByDate from "@/hooks/useDailyAppointments";
import useCalendarView from "@/hooks/useCalendarView";
import DesktopDailyView from "./day/DesktopDailyView";
import DesktopWeekView from "./week/DesktopWeekView";
import { AppointmentsProvider } from "@/utils/contexts/AppointmentsContext/AppoinmentsContext";


interface DesktopCalendarProps {
    fixer_id: string;
    requester_id: string;
}


export default function DesktopCalendar({
    fixer_id,
    requester_id
}: DesktopCalendarProps) {
    const date = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(date.getFullYear());
    const [day, setDay] = useState(date.getDate());
    const {
        view,
        handleMonthView,
        handleWeekView,
        handleDayView
    } = useCalendarView();

    const {
        isHourBooked,
        isDisabled,
        loading
    } = useAppointmentsByDate(fixer_id, date);

    const providerValue = useMemo(() => ({
        isHourBooked,
        isDisabled,
        loading
    }), [isHourBooked, isDisabled, loading]);

    const selectedDate = useMemo(() =>
        new Date(year, month, day)
        , [year, month, day]);
    return (

        <AppointmentsProvider
            isHourBooked={providerValue.isHourBooked}
            isDisabled={providerValue.isDisabled}
            loading={providerValue.loading}
        >
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
                        />}

                        {view === 'day' && <DesktopDailyView
                            date={selectedDate}
                            fixer_id={fixer_id}
                            requester_id={requester_id}
                        />}
                    </div>
                </div>
            </div>
        </AppointmentsProvider>
    );
}

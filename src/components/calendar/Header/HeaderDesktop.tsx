'use client';

import React from "react";
import { useState, useEffect } from "react";
import useCalendarNavigation from "@/hooks/useCalendarNavigation";
import useCalendarView from "@/hooks/useCalendarView";
import HeaderSection from "./HeaderSection";




interface HeaderDesktopProps {
    year: number;
    month: number;
    onChangeMonth: (newMonth: number) => void;
    onChangeYear: (newYear: number) => void;
}

const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
export default function HeaderDesktop({
    year: initialYear,
    month: initialMonth,
    onChangeMonth,
    onChangeYear,
}: HeaderDesktopProps) {

    const {
        month,
        handlePrevMonth,
        handleNextMonth,
        handleToday,
        isPrevDisabled,
        isNextDisabled
    } = useCalendarNavigation({
        initialYear,
        initialMonth,
        onChangeMonth,
        onChangeYear
    });
    const {
        view,
        handleMonthView,
        handleWeekView,
        handleDayView
    } = useCalendarView();


    return (

        <div className="text-black flex  justify-between items-center mb-4 px-2">
            <HeaderSection buttons={[
                { label: "Anterior", onClick: handlePrevMonth, disabled: isPrevDisabled },
                { label: "Hoy", onClick: handleToday, disabled: isPrevDisabled },
                { label: "Siguiente", onClick: handleNextMonth, disabled: isNextDisabled },
            ]} />
            <span className="text-lg font-semibold">{monthNames[month]}  </span>
            <HeaderSection buttons={[
                { label: "Mes", onClick: handleMonthView, disabled: view === "month" },
                { label: "Semana", onClick: handleWeekView, disabled: view === "week" },
                { label: "Día", onClick: handleDayView, disabled: view === "day" },
            ]} />
        </div >
    );



}




import { useState, useEffect } from "react";

interface useCalendarNavigationProps {
    initialYear: number;
    initialMonth: number;
    onChangeMonth: (m: number) => void;
    onChangeYear: (y: number) => void;
}


export default function useCalendarNavigation({
    initialYear,
    initialMonth,
    onChangeMonth,
    onChangeYear,
}: useCalendarNavigationProps) {
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);
    const currentDate = new Date();

    const updateMonthYear = (newMonth: number, newYear: number) => {
        setMonth(newMonth);
        setYear(newYear);

        if (onChangeMonth) onChangeMonth(newMonth);
        if (onChangeYear) onChangeYear(newYear);
    };



    const handlePrevMonth = () => {
        if (month === 0) {
            updateMonthYear(11, year - 1);
        } else {
            updateMonthYear(month - 1, year);
        }
    };

    const handleToday = () => {
        updateMonthYear(currentDate.getMonth(), currentDate.getFullYear());
    }


    const handleNextMonth = () => {
        const currentDate = new Date();
        const nextDate = new Date(year, month + 1, 1);
        const diffMonths =
            (nextDate.getFullYear() - currentDate.getFullYear()) * 12 +
            (nextDate.getMonth() - currentDate.getMonth());

        if (diffMonths > 6) return;

        if (month === 11) {
            updateMonthYear(0, year + 1);
        } else {
            updateMonthYear(month + 1, year);
        }
    };


    const isNextDisabled = (() => {
        const nextDate = new Date(year, month + 1, 1);
        const diffMonths = (nextDate.getFullYear() - currentDate.getFullYear()) * 12 + (nextDate.getMonth() - currentDate.getMonth());
        return diffMonths > 6;
    })();

    const isPrevDisabled = (() => {
        const prevDate = new Date(year, month - 1, 1);
        return prevDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    })();

    return {
        year,
        month,
        handleToday,
        handlePrevMonth,
        handleNextMonth,
        isPrevDisabled,
        isNextDisabled,
    };
}

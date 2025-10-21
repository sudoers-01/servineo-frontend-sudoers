import React from "react";

interface DayCellProps {
    date: Date;
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({ date, selectedDate, onSelect }) => {
    if(selectedDate===null){
        selectedDate=new Date(Date.now());
    }
    const selectedDateString = selectedDate.toISOString();
    const formatedDate=new Date(selectedDateString);
    const currentYear=formatedDate.getUTCFullYear();
    const currentMonth=formatedDate.getUTCMonth();
    const currentDay=formatedDate.getUTCDate();
    const currentHour=formatedDate.getUTCHours();
    const finalDate=new Date(Date.UTC(currentYear,currentMonth,currentDay,(currentHour-4),0,0));

    const isSelected =
        selectedDate &&
        date.getUTCDate() === selectedDate.getUTCDate() &&
        date.getUTCMonth() === selectedDate.getUTCMonth() &&
        date.getUTCFullYear() === selectedDate.getUTCFullYear();

    return (
        <div
            onClick={() => onSelect(date)}
            className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer text-black
        ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
        >
            <span>{date.getDate()}</span>
        </div>
    );
};

export default DayCell;

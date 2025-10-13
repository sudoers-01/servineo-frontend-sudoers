import React from "react";

interface DayCellProps {
    date: Date;
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({ date, selectedDate, onSelect }) => {
    const isSelected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

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

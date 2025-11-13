
'use client';
import { getSchedulesCont } from '@/utils/getSchedulesCont';
import useDayUtilities from '@/hooks/useDayUtilities';
import React, { useEffect, useState } from 'react';

interface DateCellProps {
    date: Date;
    fixer_id: string;
}

export default function DateCell({ date, fixer_id }: DateCellProps) {
    const {
        isToday,
        getColor,
        getText
    } = useDayUtilities({
        date,
        fixer_id
    });


    const day = date.getDate();
    return (
        <div className="border border-[#b8bec6]}">
            <div className={` h-30 flex flex-col ${isToday ? "bg-blue-300" : "bg-white"}`}>
                <div className="text-right text-black">{day}</div>
                <div className="flex-1 flex items-center">
                    <div className={`w-full p-2 rounded-md text-center text-white ${getColor()}`}>
                        <p>{getText()}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

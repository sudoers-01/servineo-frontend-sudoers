
'use client';
import { useState, useEffect } from "react";
import DesktopMonthView from "@/components/calendar/month/DesktopMonthView/DesktopMonthView";
import HeaderDesktop from "@/components/calendar/Header/HeaderDesktop";
export default function test() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    return (
        <div className="w-full flex flex-col items-center bg-white">
            <div className="w-full max-w-5xl">
                <div className="bg-green w-full">
                    <HeaderDesktop
                        year={year}
                        month={month}
                        onChangeMonth={setMonth}
                        onChangeYear={setYear}
                    />
                </div>

                <div className="bg-black w-full flex justify-center p-3">
                    <DesktopMonthView
                        fixer_id="user_fixer_1234"
                        requester_id="usuario"
                    />
                </div>
            </div>
        </div>
    );
}

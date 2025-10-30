
"use client";
import DesktopCalendar from "@/components/calendar/DesktopCalendar";



const fixer_id = "user_fixer_1234";
export default function Test() {


    return (
        <div>
            <div className="bg-white h-300">
                <DesktopCalendar
                    fixer_id={fixer_id}
                    requester_id={'unu'}
                />
            </div>
            <div className="m-30"></div>

            <div className="m-30"></div>

        </div>
    );
}

'use client';
import { useRouter } from 'next/navigation';
import MyCalendarPage from './calendarComponent';

export default function CalendarPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col font-bold bg-white min-h-screen">
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="p-2 m-4 text-gray-600 hover:text-black transition-colors self-start">
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
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <h2 className="text-black p-4 text-2xl text-center">Calendario</h2>
      </div>
      <div className="flex justify-center items-center">
        <MyCalendarPage />
      </div>
    </div>
  );
}

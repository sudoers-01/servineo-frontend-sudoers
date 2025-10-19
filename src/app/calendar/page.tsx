'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import MyCalendarPage from './calendarComponent';
import MobileCalendar from "@/components/calendar/mobile/MobileCalendar";
import MobileList from "@/components/list/MobileList";

export default function CalendarPage() {
    // Para cambiar los fixerId y los requesterId, en un futuro se sacarán de la sesión
    const fixerId = "uuid-fixer-1234";
    const [requesterId, setRequesterId] = useState("uuid-user-4567");
    // const [showRequesterIdInput, setShowRequesterIdInput] = useState(false);

    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const today = new Date();
    const events = [
        { title: 'Evento 1', date: new Date(today.getFullYear(), today.getMonth(), 5) },
        { title: 'Evento 2', date: new Date(today.getFullYear(), today.getMonth(), 12) },
        { title: 'Evento 3', date: new Date(today.getFullYear(), today.getMonth(), 12) },
    ];

    // Effect para manejar los event listeners de teclado
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Verificar si se presionaron Ctrl + Alt + E
            if (event.ctrlKey && event.altKey && event.key === 'e') {
                event.preventDefault(); // Prevenir comportamiento por defecto
                
                // Mostrar prompt para introducir requesterId
                const newRequesterId = prompt(
                    "Introduce el requesterId:",
                    requesterId
                );
                
                // Si el usuario introdujo un valor (no canceló)
                if (newRequesterId !== null) {
                    setRequesterId(newRequesterId);
                    alert(`requesterId actualizado a: ${newRequesterId}`);
                }
            }
        };

        // Agregar event listener
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup: remover event listener cuando el componente se desmonte
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [requesterId]); // Dependencia: se recrea cuando requesterId cambia

    return (
        <div className="flex flex-col font-bold bg-white min-h-screen">
            <div className="flex items-center">
                <button
                    onClick={() => router.back()}
                    className="p-2 m-4 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors self-start">
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
                            d="M6 6l12 12M6 18L18 6"
                            strokeWidth={2}     
                        />
                    </svg>
                </button>
                <h2 className="text-black p-4 text-2xl text-center">Calendario</h2>
            </div>

            {/* Indicador del requesterId actual */}
            <div className="px-4 py-2 text-sm text-gray-600 bg-gray-100">
                requesterId actual: <span className="font-mono">{requesterId}</span>
                <br />
                <span className="text-xs">Presiona Ctrl + Alt + E para cambiarlo</span>
            </div>

            <div className="flex justify-center md:block hidden">
                <MyCalendarPage 
                    fixerId={fixerId}
                    requesterId={requesterId}
                />
            </div>

            <div className="flex flex-col md:hidden justify-center gap-4" >
                <MobileCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    events={events} 
                />
                <div></div>
                <MobileList
                    selectedDate={selectedDate}
                    fixerId={fixerId}
                    requesterId={requesterId}
                />
            </div>
        </div>
    );
}
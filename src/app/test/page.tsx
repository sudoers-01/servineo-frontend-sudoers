
'use client';
import React, { useEffect, useState } from 'react';
import { getSchedulesCont } from '@/utils/getSchedulesCont';
import DatePicker from '@/components/list/DatePicker/DatePicker'
import DateCell from '@/components/calendar/month/dateCell/DateCell';
export default function TestPage() {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSchedulesCont(
                    'user_fixer_1234',
                    '2025-10-21'
                );
                setCount(result);
            } catch (err) {
                setCount(0);
            }
        };
        fetchData();
    }, []);
    const fechaActual = new Date('2025-10-27');
    const fixerId = 'user_fixer_1234';
    return (
        <div className="bg-white">
            <DateCell
                value={fechaActual}
                fixer_id={fixerId}
            />

        </div>
        /*<div className="flex flex-col items-center justify-center h-screen text-lg text-gray-800">
            <p>Probando conexión al backend...</p>
            {count !== null ? (
                <p className="mt-4">
                    Total de <strong>schedules:</strong> {count}
                </p>
            ) : (
                <p className="mt-4 text-gray-500">Cargando...</p>
            )}
        </div>*/
    );
}

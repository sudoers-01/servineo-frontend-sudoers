
'use client';
import React, { useEffect, useState } from 'react';
import { getSchedulesCont } from '@/utils/getSchedulesCont';
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

    return (
        <div className="flex flex-col items-center justify-center h-screen text-lg text-gray-800">
            <p>Probando conexión al backend...</p>
            {count !== null ? (
                <p className="mt-4">
                    Total de <strong>schedules:</strong> {count}
                </p>
            ) : (
                <p className="mt-4 text-gray-500">Cargando...</p>
            )}
        </div>
    );
}

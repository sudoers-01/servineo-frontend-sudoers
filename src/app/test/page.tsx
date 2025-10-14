
'use client';
import React, { useEffect, useState } from 'react';
import { getSchedulesCounter } from '@/utils/getSchedulesCounter';

export default function TestPage() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getSchedulesCounter(
                'uuid-fixer-1234',
                'uuid-user-4567',
                '2025-10-15'
            );
            setCount(result);
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

'use client';
import axios from 'axios';
import { getSchedulesCont } from '@/utils/getSchedulesCont';
import React, { useEffect, useState } from 'react';
interface DateCellProps {
    value: Date;
    fixer_id: string;
}

export default function DateCell({
    value,
    fixer_id
}: DateCellProps) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSchedulesCont(
                    fixer_id,
                    value.toISOString().split('T')[0]
                );
                setCount(result);
            } catch (err) {
                setCount(0);
            }
        };
        fetchData();
    }, [value, fixer_id]);

    return (
        < div className="p-2 border rounded text-center" >
            <p>Citas: {count !== null ? count : 'Cargando...'}</p>
        </div >
    )


};

'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AppointmentsContextType {
    isHourBooked: (date: Date, hour: number) => boolean;
    isDisabled: (date: Date, hour: number) => boolean;

}

const AppoinmentsContext = createContext<AppointmentsContextType | null>(null);


export function useAppointmentsContext() {
    const context = useContext(AppointmentsContext);
    if (!context) {
        throw new Error('useAppointmentsContext must be within AppointmentsProvider');

    }

    return context;
}

interface AppointmentsProvider {

}


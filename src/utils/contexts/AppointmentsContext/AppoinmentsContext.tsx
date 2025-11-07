'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AppointmentsContextType {
    isHourBooked: (date: Date, hour: number) => boolean;
    isDisabled: (date: Date, hour: number) => boolean;
    loading: boolean;

}

const AppointmentsContext = createContext<AppointmentsContextType | null>(null);


export function useAppointmentsContext() {
    const context = useContext(AppointmentsContext);
    if (!context) {
        throw new Error('useAppointmentsContext must be within AppointmentsProvider');

    }

    return context;
}

interface AppointmentsProviderProps {
    children: ReactNode;
    isHourBooked: (date: Date, hour: number) => boolean;
    isDisabled: (date: Date, hour: number) => boolean;
    loading: boolean;
}

export function AppointmentsProvider({
    children,
    isHourBooked,
    isDisabled,
    loading
}: AppointmentsProviderProps) {
    return (
        <AppointmentsContext.Provider value={{
            isHourBooked,
            isDisabled,
            loading
        }}>
            {children}
        </AppointmentsContext.Provider>
    );
}

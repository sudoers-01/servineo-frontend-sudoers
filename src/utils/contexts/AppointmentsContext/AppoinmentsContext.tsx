'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';

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
    loading,
}: AppointmentsProviderProps) {
    const value = useMemo(
        () => ({ isHourBooked, isDisabled, loading }),  // ← AGREGAR
        [isHourBooked, isDisabled, loading]  // ← AGREGAR
    );

    return (
        <AppointmentsContext.Provider value={value}>
            {children}
        </AppointmentsContext.Provider>
    );
}

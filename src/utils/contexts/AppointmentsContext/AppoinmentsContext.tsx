'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';

interface AppointmentsContextType {
    isHourBooked: (date: Date, hour: number) => boolean;
    isDisabled: (date: Date, hour: number) => boolean;
    isCanceled: (date: Date, hour: number, requester_id: string) => boolean;
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
    isCanceled: (date: Date, hour: number, requester_id: string) => boolean;
    loading: boolean;

}

export function AppointmentsProvider({
    children,
    isHourBooked,
    isDisabled,
    isCanceled,
    loading
}: AppointmentsProviderProps) {
    const value = useMemo(
        () => ({ isHourBooked, isDisabled, isCanceled, loading }),  // ← AGREGAR
        [isHourBooked, isDisabled, isCanceled, loading]  // ← AGREGAR
    );

    return (
        <AppointmentsContext.Provider value={value}>
            {children}
        </AppointmentsContext.Provider>
    );
}

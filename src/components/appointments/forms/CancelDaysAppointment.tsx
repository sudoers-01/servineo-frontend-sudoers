import React, { useState, useEffect } from 'react';
import { Button } from '../../atoms/button';

interface DayWithAppointments {
  date: string; // formato: "YYYY-MM-DD"
  appointmentCount: number;
  dayName: string;
  dayNumber: number;
  monthName: string;
}

interface CancelDaysAppointmentsProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDays: string[]) => void;
  loading?: boolean;
}

export const CancelDaysAppointments: React.FC<CancelDaysAppointmentsProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [daysWithAppointments, setDaysWithAppointments] = useState<DayWithAppointments[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  async function fetchDaysWithAppointments(currentMonth: number, currentYear: number) {
    const fecha = await fetch(`${API}/appointments/days-with-appointments?month=${currentMonth}&year=${currentYear}`);
  }
fetchDaysWithAppointments(currentMonth, currentYear);

  // ******************************************************************
  // AQUÍ DEBES CARGAR LOS DÍAS CON CITAS DESDE EL BACKEND
  // Reemplaza este useEffect con tu llamada API real
  // El backend debe filtrar por mes y año actual
  // ******************************************************************
  useEffect(() => {
    if (isOpen) {
      const fetchDaysWithAppointments = async () => {
        try {
          // TODO: Reemplazar con tu llamada real al API
          // const response = await yourApiCall(currentMonth, currentYear);
          // setDaysWithAppointments(response.data);
          
          // Data de ejemplo basada en la imagen para Octubre
          const mockData: DayWithAppointments[] = [
            { date: '2024-10-19', appointmentCount: 4, dayName: 'Lunes', dayNumber: 19, monthName: 'Octubre' },
            { date: '2024-10-20', appointmentCount: 4, dayName: 'Martes', dayNumber: 20, monthName: 'Octubre' },
            { date: '2024-10-22', appointmentCount: 3, dayName: 'Jueves', dayNumber: 22, monthName: 'Octubre' },
            { date: '2024-10-23', appointmentCount: 2, dayName: 'Viernes', dayNumber: 23, monthName: 'Octubre' },
            { date: '2024-10-27', appointmentCount: 5, dayName: 'Martes', dayNumber: 27, monthName: 'Octubre' },
            { date: '2024-10-28', appointmentCount: 5, dayName: 'Miércoles', dayNumber: 28, monthName: 'Octubre' },
          ];
          setDaysWithAppointments(mockData);
        } catch (error) {
          console.error('Error fetching appointments:', error);
        }
      };

      fetchDaysWithAppointments();
      setSelectedDays([]); // Reset selección al abrir
    }
  }, [isOpen, currentMonth, currentYear]);

  const toggleDaySelection = (date: string) => {
    setSelectedDays(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else if (prev.length < 5) {
        return [...prev, date];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedDays);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        {/* Barra azul superior más grande con botón X */}
        <div className="bg-blue-600 h-12 px-4 flex items-center justify-between">
          <div className="w-6"></div> {/* Espacio para centrar */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navegación del mes */}
        <div className="flex items-center justify-center space-x-4 py-4">
          <button
            onClick={() => changeMonth('prev')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          
          <h2 className="text-black text-xl text-center ">
            {months[currentMonth]}
          </h2>
          
          <button
            onClick={() => changeMonth('next')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 max-h-96 overflow-y-auto">
         

          <div className="space-y-2">
            {daysWithAppointments.map((day) => (
              <div
                key={day.date}
                className={` text-black flex items-center justify-between p-3 border rounded cursor-pointer transition-all ${
                  selectedDays.includes(day.date)
                    ? 'bg-blue-50 border-blue-300 border-2'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => toggleDaySelection(day.date)}
              >
                <span className="font-medium">
                  <strong>{day.dayName} {day.dayNumber}</strong> - {day.appointmentCount} citas
                </span>
                
                {/* Checkbox cuadrado a la derecha */}
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                  selectedDays.includes(day.date) 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-400'
                }`}>
                  {selectedDays.includes(day.date) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected counter */}
          <div className="mt-4 text-sm text-gray-700">
            <strong>Seleccionado: {selectedDays.length}</strong>
          </div>
        </div>

        {/* Footer con botón pegado a la derecha */}
        <div className="border-t p-4 flex justify-end">
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={selectedDays.length === 0 || loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-medium"
          >
            {loading ? 'Cancelando...' : 'Cancelar citas'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelDaysAppointments;
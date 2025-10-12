'use client';

import React, { useRef, useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views, SlotInfo, Event as RBCEvent, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import AppointmentForm, { AppointmentFormHandle } from "../../components/appointments/forms/AppointmentForm";
import { generateAvailableSlots, SlotEvent } from "../../utils/generateAvailableSlots";
import EditAppointmentForm, { EditAppointmentFormHandle, ExistingAppointment } from "../../components/appointments/forms/EditAppointmentForm";
import MultiStepAppointment,{ MultiStepAppointmentHandle } from "../../components/appointments/forms/MultiStepAppointmentForm";
moment.locale('es');
const localizer = momentLocalizer(moment);

interface MyEvent {
  title: string;
  start: Date;
  end: Date;
  id: string;
  booked: boolean;
}

export default function MyCalendarPage() {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const formRef = useRef<MultiStepAppointmentHandle | null>(null);
  const editFormRef = useRef<EditAppointmentFormHandle | null>(null);

  // pre-generar slots de disponibilidad para 30 días
  useEffect(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    const slots: SlotEvent[] = generateAvailableSlots(start, end);
    setEvents(slots.map(s => ({ ...s })));
  }, []);

  function handleSelectEvent(ev: MyEvent) {
    if (ev.booked) {
      handleEditExistingAppointment(ev); // ← Editar cita existente
    } else {
      formRef.current?.open(ev.start.toISOString(), { eventId: ev.id, title: ev.title }); // ← Crear nueva
    }
  }

  function handleSelectSlot(slotInfo: SlotInfo) {
    // No permitir hacer clic en slots en vistas MONTH y WEEK
    if (currentView === Views.MONTH || currentView === Views.WEEK) {
      return;
    }

    const start = slotInfo.start;
    const day = start.getDay();
    const hour = start.getHours();
    if (day < 1 || day > 5) return;
    if (!((hour >= 8 && hour < 12) || (hour >= 14 && hour < 18))) return;

    const dtISO = start.toISOString();
    let existing = events.find(e => e.start.toISOString() === dtISO);
    if (!existing) {
      const newEvent: MyEvent = { title: "Disponible", start, end: new Date(start.getTime() + 60 * 60 * 1000), booked: false, id: dtISO };
      setEvents(prev => [...prev, newEvent]);
      existing = newEvent;
    }
    formRef.current?.open(dtISO, { eventId: existing.id, title: existing.title });
  }

  function handleEditExistingAppointment(event: MyEvent) {
    if (!event.booked) return; // Solo editar citas ya reservadas
    
    // Esto es temporal - luego vendrá de tu base de datos
    const existingAppointment: ExistingAppointment = {
      id: event.id,
      datetime: event.start.toISOString(),
      client: "Cliente Ejemplo", // Esto vendrá de tu DB
      contact: "+591 77777777",  // Esto vendrá de tu DB
      modality: "virtual",       // Esto vendrá de tu DB
      description: event.title,
      meetingLink: "https://meet.example.com/abc123"
    };
    
    editFormRef.current?.open(existingAppointment);
  }

  useEffect(() => {
    const onCreated = (ev: any) => {
      const { datetime, id, meta } = ev.detail || {};
      if (!datetime) return;
      const normalized = new Date(datetime).toISOString();

      setEvents(prev => {
        let found = false;
        const next = prev.map(item => {
          if (new Date(item.start).toISOString() === normalized) {
            found = true;
            return { ...item, booked: true, id: id || item.id, title: meta?.description || "Cita reservada" };
          }
          return item;
        });
        if (!found) {
          const newEvent: MyEvent = {
            title: meta?.description || "Cita reservada",
            start: new Date(datetime),
            end: new Date(new Date(datetime).getTime() + 60 * 60 * 1000),
            booked: true,
            id: id || String(Date.now())
          };
          return [...next, newEvent];
        }
        return next;
      });
    };

    window.addEventListener("booking:created", onCreated);
    return () => window.removeEventListener("booking:created", onCreated);
  }, []);

  function eventStyleGetter(event: MyEvent) {
    return {
      style: {
        backgroundColor: event.booked ? "#FFC857" : "#16A34A",
        color: "#fff",
        borderRadius: 12,
        border: "none",
        padding: "2px 6px"
      }
    };
  }

  // Función para aplicar estilos a los días
  const dayPropGetter = (date: Date) => {
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6; // 0 = domingo, 6 = sábado
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear();
    
    // Solo aplicar el color azul al día actual en la vista MONTH
    if (isToday && currentView === Views.MONTH) {
      return {
        style: {
          backgroundColor: '#2B6AE0',
          color: '#fff'
        }
      };
    }
    
    if (isWeekend) {
      return {
        style: {
          backgroundColor: '#f0f0f0',
          color: '#999',
          cursor: 'default'
        }
      };
    }
    
    return {
      style: {
        backgroundColor: '#fff',
        color: '#333'
      }
    };
  };

  // Manejar cambio de vista
  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Mi Calendario</h1>
      <div style={{ height: '600px', margin: '20px' }}>
        <Calendar
          className="bg-[#F1F5F8] text-black rounded-2xl"
          localizer={localizer}
          events={events as RBCEvent[]}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', borderRadius: 16 }}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          selectable
          onSelectEvent={(event) => handleSelectEvent(event as MyEvent)}
          onSelectSlot={(slotInfo) => handleSelectSlot(slotInfo)}
          eventPropGetter={(event) => eventStyleGetter(event as MyEvent)}
          dayPropGetter={dayPropGetter}
          min={new Date(0, 0, 0, 8, 0, 0)} 
          max={new Date(0, 0, 0, 18, 0, 0)} 
          popup
          onView={handleViewChange}
        />
      </div>
      <MultiStepAppointment ref={formRef} />
      <EditAppointmentForm ref={editFormRef} />
    </div>
  );
}
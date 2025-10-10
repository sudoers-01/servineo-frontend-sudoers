'use client'; // si usas Next.js App Router

import { useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar moment en español
moment.locale('es');

const localizer = momentLocalizer(moment);

interface MyEvent {
  title: string;
  start: Date;
  end: Date;
}

export default function MyCalendarPage() {
  const [events, setEvents] = useState<MyEvent[]>([
    //eventos
    {
      title: 'Evento 1',
      start: new Date(2025, 9, 10, 10, 0),
      end: new Date(2025, 9, 10, 12, 0),
    },
    {
      title: 'Otro evento',
      start: new Date(2025, 9, 15, 14, 0),
      end: new Date(2025, 9, 15, 15, 0),
    },
  ]);

  return (
    <div style={{ height: '600px', margin: '20px' }}>
      <Calendar className='bg-[#F1F5F8] text-black rounded-2xl w-200'
      //si se puede corregir el roundend, bendito seas
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        selectable
        //para cuando seleccionan un evento en el calendario que ya existe
        onSelectEvent={(event) => alert(`Has seleccionado: ${event.title}`)}
        //para cuando selecciona algun slot, deberia tener posibilidad de elegir horas
        onSelectSlot={(slotInfo) => {
          const title = window.prompt('Título para nuevo evento');
          if (title) {
            setEvents((prev) => [
              ...prev, //esto es como decir todo el contenido anterior de prev
              {
                title,
                start: slotInfo.start,
                end: slotInfo.end,
              },
            ]);
          }
        }}
      />
    </div>
  );
}

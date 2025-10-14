// lib/generateAvailableSlotsFromAPI.ts
//const createModule = require('../../../servineo-backend-Lorem/src/modules/controladores/CRUD_operations/create.js');
//const readModule = require('../../../servineo-backend-Lorem/src/modules/controladores/CRUD_operations/read');
//const updateModule = require('../../../servineo-backend-Lorem/src/modules/controladores/CRUD_operations/update.js');
//const deleteModule = require('../../../servineo-backend-Lorem/src/modules/controladores/CRUD_operations/delete.js');

//const Appointment = require('../../../servineo-backend-Lorem/src/models/Appointment.js');

//API POSTMAN
const API = process.env.NEXT_PUBLIC_API_BASE_URL as string;

import moment from 'moment';

export interface SlotEvent {
  title: string;
  start: Date;
  end: Date;
  booked: boolean;
  color?: string;
  id: string;
  cancelledByUser?: boolean;
  editable?: boolean;
}

export interface Schedule {
  _id: string;
  starting_time: string;
  finishing_time: string;
  schedule_state: string;
}

/**
 * Genera slots disponibles para horarios laborales que no tienen schedules
 * Solo genera slots para días futuros (no anteriores a hoy)
 */
function generateAvailableSlotsForMonth(month: number, year: number, fixerId: string): SlotEvent[] {
  const slots: SlotEvent[] = [];
  
  // Obtener el primer y último día del mes
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  console.log(startDate, endDate);
  
  const current = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a inicio del día
  
  while (current <= endDate) {
    // 🔹 SOLO generar slots para días futuros (incluyendo hoy)
    if (current >= today) {
      const day = current.getDay(); // 0=domingo, 6=sábado
      
      // Solo días laborales (lunes a viernes)
      if (day >= 1 && day <= 5) {
        // Horario mañana: 8-12
        for (let hour = 8; hour < 12; hour++) {
          const start = new Date(current);
          start.setHours(hour, 0, 0, 0);
          const end = new Date(start);
          end.setHours(hour + 1);
          
          // 🔹 Para el día actual, solo generar slots futuros (no horas pasadas)
          if (start > new Date()) {
            slots.push({
              title: "Disponible",
              start,
              end,
              booked: false,
              color: "#16A34A",
              id: `available-${fixerId}-${start.toISOString()}`
            });
          }
        }
        
        // Horario tarde: 14-18
        for (let hour = 14; hour < 18; hour++) {
          const start = new Date(current);
          start.setHours(hour, 0, 0, 0);
          const end = new Date(start);
          end.setHours(hour + 1);
          
          // 🔹 Para el día actual, solo generar slots futuros (no horas pasadas)
          if (start > new Date()) {
            slots.push({
              title: "Disponible",
              start,
              end,
              booked: false,
              color: "#16A34A",
              id: `available-${fixerId}-${start.toISOString()}`
            });
          }
        }
      }
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return slots;
}

/**
 * Genera los slots de un fixer específico desde la API + slots disponibles
 */
export async function generateAvailableSlotsFromAPI(
  fixerId: string, 
  requesterId: string,
  selectedDate: Date | null
): Promise<SlotEvent[]> {
  const slots: SlotEvent[] = [];
  const currentYear = new Date().getFullYear();
  const month = selectedDate ? selectedDate.getMonth() : 1;

  try {
    // 🔹 Obtener citas del fixer específico para el mes
    const response = await fetch(`${API}/bookings/fixer/${fixerId}/schedules/${month}`)
    //const response = await readModule.get_schedule_by_fixer_month(fixerId, requesterId, month);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    //TODO DESCOMENTAR CON EL ENDPOINT
    //const fixerAppointments = await response.json();
    //const fixerSchedules: Schedule[] = [];
    const fixerSchedules: Schedule[] = await response.json();
    /*
    for (const appointment of fixerAppointments) {
      const currentSchedule = appointment.schedules;

      for (const singleSchedule of currentSchedule) {
        // Crear un nuevo objeto Schedule excluyendo el _id
        const scheduleWithoutId: Schedule = {
          starting_time: singleSchedule.starting_time,
          finishing_time: singleSchedule.finishing_time,
          schedule_state: singleSchedule.schedule_state
        };
        
        fixerSchedules.push(scheduleWithoutId);
      }
    }
    */
    // 🔹 Generar todos los slots disponibles para el mes (solo futuros)
    const availableSlots = generateAvailableSlotsForMonth(month, currentYear, fixerId);
    
    // 🔹 Procesar los schedules existentes de la API
    for (const schedule of fixerSchedules) {
      const start = moment(schedule.starting_time).toDate();
      const end = moment(schedule.finishing_time).toDate();
      
      let slot: SlotEvent = {
        title: "Disponible",
        start,
        end,
        booked: false,
        // TODO: devolver el id cuando ya este listo desde la BD
        id: `fixer-${fixerId}-${start.toISOString()}`,
      };

      // 🔹 Determinar estado basado en el schedule
      switch (schedule.schedule_state) {
        case "occupied":
          slot.title = "Ocupado";
          slot.color = "#64748B";
          slot.booked = true;
          break;

        case "cancelled":
          slot.title = "Cancelado";
          slot.color = "#FF5F57";
          slot.cancelledByUser = true;
          slot.booked = true;
          break;

        case "booked":
          slot.title = "Reservado";
          slot.color = "#F59E0B";
          slot.booked = true;
          slot.editable = true;
          break;

        case "available":
        default:
          slot.title = "Disponible";
          slot.color = "#16A34A";
          break;
      }

      slots.push(slot);
    }
    
    // 🔹 Combinar: slots de la API + slots disponibles que no están en la API
    const finalSlots: SlotEvent[] = [...slots];
    
    // Agregar slots disponibles que no tienen schedule en la API
    for (const availableSlot of availableSlots) {
      const exists = slots.some(scheduleSlot => 
        scheduleSlot.start.getTime() === availableSlot.start.getTime()
      );
      
      if (!exists) {
        finalSlots.push(availableSlot);
      }
    }
    
    // Ordenar por fecha
    finalSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    return finalSlots;
  } catch (err) {
    console.error("Error al generar los slots para el fixer:", fixerId, err);
    
    // En caso de error, generar solo los slots disponibles (solo futuros)
    return generateAvailableSlotsForMonth(month, currentYear, fixerId);
  }
}
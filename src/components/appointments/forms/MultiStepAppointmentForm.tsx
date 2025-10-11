// components/appointments/multi-step/MultiStepAppointment.tsx
import React, { useRef, forwardRef, useImperativeHandle } from "react";
import AppointmentForm, { AppointmentFormHandle, AppointmentPayload } from "../forms/AppointmentForm";
import LocationForm, { LocationFormHandle, LocationData } from "../forms/LocationForm";

export type MultiStepAppointmentHandle = {
  open: (datetimeISO: string, meta?: { eventId?: string; title?: string }) => void;
  close: () => void;
};

interface MultiStepAppointmentProps {}

const MultiStepAppointment = forwardRef<MultiStepAppointmentHandle, MultiStepAppointmentProps>((_props, ref) => {
  const appointmentFormRef = useRef<AppointmentFormHandle>(null);
  const locationFormRef = useRef<LocationFormHandle>(null);

  // Datos temporales entre pasos
  const tempDataRef = useRef<{
    appointmentData?: Partial<AppointmentPayload>;
    datetime?: string;
    meta?: { eventId?: string; title?: string };
  }>({});

  useImperativeHandle(ref, () => ({
    open: (datetimeISO: string, meta?: { eventId?: string; title?: string }) => {
      tempDataRef.current = { datetime: datetimeISO, meta };
      appointmentFormRef.current?.open(datetimeISO, meta);
    },
    close: () => {
      appointmentFormRef.current?.close();
      locationFormRef.current?.close();
      tempDataRef.current = {};
    }
  }), []);

  const handleAppointmentSubmit = (appointmentData: Partial<AppointmentPayload>) => {
  // Si es virtual, no abrir el LocationForm - procesar directamente
    if (appointmentData.modality === "virtual") {
        const completeData: AppointmentPayload = {
        ...appointmentData,
        datetime: tempDataRef.current.datetime!,
        meetingLink: appointmentData.meetingLink || `https://meet.example.com/${Math.random().toString(36).slice(2, 9)}`
        } as AppointmentPayload;
                console.log("Cita virtual creada:", completeData);
        window.dispatchEvent(new CustomEvent("booking:created", { 
        detail: { 
            datetime: completeData.datetime, 
            id: String(Date.now()), 
            meta: completeData 
        } 
        }));
        
        appointmentFormRef.current?.close();
        tempDataRef.current = {};
        return;
    }
    
    // Si es presencial, guardar datos y abrir LocationForm
        tempDataRef.current.appointmentData = appointmentData;
    
        const initialLocationData: LocationData = {
            modality: appointmentData.modality || "virtual",
            place: appointmentData.place,
            meetingLink: appointmentData.meetingLink
        };

        locationFormRef.current?.open(initialLocationData);
    };

  const handleLocationBack = () => {
    // Volver al primer paso con los datos guardados
    if (tempDataRef.current.datetime) {
      appointmentFormRef.current?.open(
        tempDataRef.current.datetime, 
        tempDataRef.current.meta
      );
    }
  };

  const handleLocationSelected = (locationData: LocationData) => {
    // Combinar datos de ambos pasos y enviar
    const completeData: AppointmentPayload = {
      ...tempDataRef.current.appointmentData!,
      ...locationData,
      datetime: tempDataRef.current.datetime!
    } as AppointmentPayload;

    // Aquí enviarías los datos completos al backend
    console.log("Datos completos de la cita:", completeData);
    
    // Por ahora, simular éxito
    window.dispatchEvent(new CustomEvent("booking:created", { 
      detail: { 
        datetime: completeData.datetime, 
        id: String(Date.now()), 
        meta: completeData 
      } 
    }));

    // Cerrar todo
    appointmentFormRef.current?.close();
    locationFormRef.current?.close();
    tempDataRef.current = {};
  };

  return (
    <>
      <AppointmentForm 
        ref={appointmentFormRef}
        onNextStep={handleAppointmentSubmit} // Necesitarás modificar AppointmentForm para aceptar esta prop
      />
      <LocationForm
        ref={locationFormRef}
        onLocationSelected={handleLocationSelected}
        onBack={handleLocationBack}
      />
    </>
  );
});

export default MultiStepAppointment;
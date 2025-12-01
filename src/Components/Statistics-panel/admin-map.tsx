'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 


export interface Appointment {
  id: string;
  fixerName: string;
  requesterName: string;
  date: string;
  status: 'booked' | 'cancelled';
  lat: number;
  lng: number;
  service?: string;
}


const formatBoDate = (isoString: string) => {
  if (!isoString) return 'Fecha pendiente';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};


const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


function FitBounds({ appointments }: { appointments: Appointment[] }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();

  useEffect(() => {
    if (appointments.length > 0) {
      const bounds = L.latLngBounds(appointments.map(app => [app.lat, app.lng]));
      map.fitBounds(bounds, { padding: [50, 50] }); 
    }
  }, [appointments, map]);

  return null;
}


const bookedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const cancelledIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface AdminMapProps {
  appointments: Appointment[];
}

const AdminMap: React.FC<AdminMapProps> = ({ appointments }) => {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={[-17.39, -66.15]} zoom={13} className="h-full w-full rounded-lg">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <FitBounds appointments={appointments} />
        {appointments.map((appointment) => (
          <Marker
            key={appointment.id}
            position={[appointment.lat, appointment.lng]}
            icon={appointment.status === 'booked' ? bookedIcon : cancelledIcon}
          >
            <Popup>
              <div className="text-sm text-gray-800 min-w-[200px]">
                <div className="mb-2 pb-1 border-b border-gray-200">
                  <span className={`font-bold text-xs uppercase ${appointment.status === 'booked' ? 'text-green-600' : 'text-red-600'}`}>
                    {appointment.status === 'booked' ? '• Cita Activa' : '• Cancelada'}
                  </span>
                </div>
                <p className="mb-1"><span className="font-bold text-blue-600">Fixer:</span> {appointment.fixerName}</p>
                <p className="mb-1"><span className="font-bold text-gray-600">Requester:</span> {appointment.requesterName}</p>
                <p className="mb-1"><span className="font-bold text-gray-600">Fecha:</span> {formatBoDate(appointment.date)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AdminMap;
'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface JobApplication {
  name: string;
  description: string;
  date: string;
}

interface Location {
  lat: number;
  lon: number;
}

interface JobSummaryModalProps {
  formData: JobApplication;
  location: Location | null;
  setLocation: (value: Location) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({
  position,
  setPosition,
}: {
  position: Location;
  setPosition: (pos: Location) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });

  return (
    <Marker
      position={[position.lat, position.lon]}
      icon={markerIcon}
      draggable={true}
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lon: lng });
        },
      }}
    />
  );
}

const JobSummaryModal: React.FC<JobSummaryModalProps> = ({
  formData,
  location,
  setLocation,
  onClose,
  onConfirm,
}) => {
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='bg-green-100 rounded-xl shadow-lg w-[600px] p-6 border border-green-400'>
        <h3 className='text-center text-lg font-semibold text-gray-700 mb-4'>
          Job Request Summary
        </h3>

        <p className='text-gray-700'>
          <strong>Job:</strong> {formData.name}
        </p>
        <p className='text-gray-700'>
          <strong>Description:</strong> {formData.description}
        </p>
        <p className='text-gray-700 mb-4'>
          <strong>Date:</strong> {formData.date}
        </p>

        <div className='mb-3'>
          <p className='font-medium text-gray-700 mb-1'>Location:</p>
          {location ? (
            <p className='text-sm text-gray-600 mb-2'>
              Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
            </p>
          ) : (
            <p className='text-sm text-gray-500 mb-2'>Retrieving current location...</p>
          )}
        </div>

        {location && (
          <div className='w-full h-64 rounded-lg overflow-hidden border border-green-400 mb-4'>
            <MapContainer
              center={[location.lat, location.lon]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&copy; OpenStreetMap contributors'
              />
              <LocationMarker position={location} setPosition={setLocation} />
            </MapContainer>
          </div>
        )}

        <div className='flex justify-end gap-4 mt-6'>
          <button
            onClick={onClose}
            className='px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSummaryModal;

'use client';
import React, { useState, useEffect } from 'react';
import JobRequestForm from './JobRequestForm';
import { getUserLocation, createJobRequest } from '../../../services/job-request.modal';
import { UserLocation, CreateJobRequestPayload, JobRequest, Location, JobRequestData, JobRequestModalProps } from '../../../types/job-request';

const JobRequestModal: React.FC<JobRequestModalProps> = ({ isOpen, onClose, onSubmit, fixerId }) => {
  const [initialLocation, setInitialLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const authToken = localStorage.getItem('auth-token');
      setToken(authToken);

      const fetchUserLocation = async () => {
        if (!authToken) {
          setError('No hay token de autenticación');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError('');
        try {
          const userLocation: UserLocation = await getUserLocation(authToken);

          const locationForMap: Location = {
            lat: parseFloat(userLocation.lat),
            lng: parseFloat(userLocation.lng),
          };

          setInitialLocation(locationForMap);
        } catch (err: unknown) {
          console.error('Error al obtener ubicación:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setLoading(false);
        }
      };

      fetchUserLocation();
    } else {
      setToken(null);
    }
  }, [isOpen]);

  const handleFormSubmit = async (formData: JobRequestData, newLocation: Location | null) => {
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalLocation: { type: 'Point'; coordinates: [string, string] };
      if (formData.locationOption === 'modify' && newLocation) {
        finalLocation = {
          type: 'Point' as const,
          coordinates: [newLocation.lat.toString(), newLocation.lng.toString()] as [string, string],
        };
      } else if (initialLocation) {
        finalLocation = {
          type: 'Point' as const,
          coordinates: [initialLocation.lat.toString(), initialLocation.lng.toString()] as [string, string],
        };
      } else {
        throw new Error('No se ha definido una ubicación para el trabajo.');
      }

      const requesterId = "68ec99ddf39c7c140f42fcfa";

      const payload: CreateJobRequestPayload = {
        jobMotive: formData.jobMotive,
        jobDescription: formData.jobDescription,
        location: finalLocation,
        startTime: formData.startTime,
        endTime: formData.endTime,
        suggestedRate: formData.suggestedRate || '0',
        id_fixer: fixerId,
        requesterId: requesterId,
      };

      const data: JobRequest = await createJobRequest(payload, token);

      onSubmit(data);
      onClose();
    } catch (err: unknown) {
      console.error('Error al enviar solicitud:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={handleOverlayClick}
    >
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
        <div className='bg-blue-600 text-white p-4'>
          <h2 className='text-xl font-bold text-center'>Formulario de solicitud</h2>
        </div>

        <div className='p-6 overflow-y-auto max-h-[calc(90vh-80px)]'>
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          <JobRequestForm
            initialLocation={initialLocation}
            loading={loading}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default JobRequestModal;

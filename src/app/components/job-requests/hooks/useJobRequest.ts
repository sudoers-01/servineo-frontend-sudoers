'use client';
import { useState, useEffect } from 'react';
import { getUserLocation, createJobRequest } from '@/services/job-requests';
import { JobRequestFormData, UserLocation, CreateJobRequestPayload } from '@/types/job-request';

export function useJobRequest(isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void) {
  const [formData, setFormData] = useState<JobRequestFormData>({
    jobMotive: '',
    jobDescription: '',
    locationOption: 'keep',
    startTime: '',
    endTime: '',
    suggestedRate: '',
  });

  const [initialLocation, setInitialLocation] = useState<UserLocation | null>(null);
  const [newLocation, setNewLocation] = useState<UserLocation | null>(null);
  const [currentMapLocation, setCurrentMapLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthToken = (): string | null => localStorage.getItem('token');

  const resetForm = () => {
    setFormData({
      jobMotive: '',
      jobDescription: '',
      locationOption: 'keep',
      startTime: '',
      endTime: '',
      suggestedRate: '',
    });
    setNewLocation(null);
  };

  useEffect(() => {
    if (isOpen) {
      const fetchUserLocation = async () => {
        setLoading(true);
        setError('');
        try {
          const token = getAuthToken();
          if (!token) throw new Error('No se encontró token de autenticación.');

          const userLocation = await getUserLocation(token);
          setInitialLocation(userLocation);
          setCurrentMapLocation(userLocation);
        } catch (err) {
          console.error('Error al obtener ubicación:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setLoading(false);
        }
      };

      fetchUserLocation();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.locationOption === 'keep' && initialLocation) {
      setCurrentMapLocation(initialLocation);
      setNewLocation(null);
    } else if (formData.locationOption === 'modify' && newLocation) {
      setCurrentMapLocation(newLocation);
    } else if (formData.locationOption === 'modify' && initialLocation) {
      setCurrentMapLocation(initialLocation);
    }
  }, [formData.locationOption, initialLocation, newLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (pos: { lat: number; lng: number }) => {
    setNewLocation({ lat: pos.lat, lng: pos.lng });
    setCurrentMapLocation({ lat: pos.lat, lng: pos.lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No se encontró token de autenticación.');

      let finalLocation: CreateJobRequestPayload['location'];
      
      if (formData.locationOption === 'modify' && newLocation) {
        finalLocation = {
          type: 'Point',
          coordinates: [newLocation.lng, newLocation.lat],
        };
      } else if (initialLocation) {
        finalLocation = {
          type: 'Point',
          coordinates: [initialLocation.lng, initialLocation.lat],
        };
      } else {
        throw new Error('No se ha definido una ubicación para el trabajo.');
      }

      const payload: CreateJobRequestPayload = {
        jobMotive: formData.jobMotive,
        jobDescription: formData.jobDescription,
        location: finalLocation,
        startTime: formData.startTime,
        endTime: formData.endTime,
        suggestedRate: Number(formData.suggestedRate) || 0,
      };

      const data = await createJobRequest(payload, token);
      onSubmit(data);
      onClose();
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    initialLocation,
    currentMapLocation,
    isMapEnabled: formData.locationOption === 'modify',
    handleInputChange,
    handleSubmit,
    handlePositionChange,
    resetForm,
  };
}
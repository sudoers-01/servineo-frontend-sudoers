'use client';
import React, { useState, useCallback, useMemo } from 'react';
import MapJobRequest from './MapJobRequest';
import { JobRequestData, Location, JobRequestFormProps } from '../../../types/job-request';

const MapJobRequestMemo = React.memo(MapJobRequest);

const JobRequestForm: React.FC<JobRequestFormProps> = ({
  initialLocation,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<JobRequestData>({
    jobMotive: '',
    jobDescription: '',
    locationOption: 'keep',
    startTime: '',
    endTime: '',
    suggestedRate: '',
  });

  const [newLocation, setNewLocation] = useState<Location | null>(null);

  const currentMapLocation = useMemo(() => {
    if (formData.locationOption === 'modify' && newLocation) {
      return newLocation;
    }
    return initialLocation || { lat: -16.5, lng: -68.15 };
  }, [formData.locationOption, newLocation, initialLocation]);

  const isMapEnabled = formData.locationOption === 'modify';

  const handlePositionChange = useCallback((pos: Location) => {
    setNewLocation({ lat: pos.lat, lng: pos.lng });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, newLocation);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <label htmlFor='jobMotive' className='block text-sm font-medium text-gray-700 mb-2'>
          Motivo del trabajo:
        </label>
        <input
          type='text'
          id='jobMotive'
          name='jobMotive'
          value={formData.jobMotive}
          onChange={handleInputChange}
          placeholder='Ingrese el motivo del trabajo...'
          required
          disabled={loading}
          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-900 placeholder-gray-500'
        />
      </div>

      <div>
        <label htmlFor='jobDescription' className='block text-sm font-medium text-gray-700 mb-2'>
          Descripción:
        </label>
        <textarea
          id='jobDescription'
          name='jobDescription'
          value={formData.jobDescription}
          onChange={handleInputChange}
          placeholder='Describa el trabajo a realizar...'
          required
          disabled={loading}
          rows={4}
          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-900 placeholder-gray-500 resize-none'
        />
      </div>

      <fieldset className='border border-gray-300 rounded-md p-4'>
        <legend className='text-sm font-medium text-gray-700 px-2'>Ubicación del trabajo:</legend>
        <div className='space-y-2'>
          <label className='flex items-center'>
            <input
              type='radio'
              name='locationOption'
              value='keep'
              checked={formData.locationOption === 'keep'}
              onChange={handleInputChange}
              disabled={loading}
              className='mr-2'
            />
            Mantener ubicación guardada
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              name='locationOption'
              value='modify'
              checked={formData.locationOption === 'modify'}
              onChange={handleInputChange}
              disabled={loading}
              className='mr-2'
            />
            Modificar ubicación del trabajo
          </label>
        </div>
      </fieldset>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>Mapa de ubicación:</label>
        {loading && !initialLocation ? (
          <div className='flex items-center justify-center h-48 bg-gray-100 rounded-md'>
            <p className='text-gray-500'>Cargando mapa...</p>
          </div>
        ) : (
          <MapJobRequestMemo
            isEnabled={isMapEnabled}
            initialLocationObject={currentMapLocation}
            onPositionChange={handlePositionChange}
          />
        )}
      </div>
      
      <div>
        <label htmlFor='suggestedRate' className='block text-sm font-medium text-gray-700 mb-2'>
          Tarifa sugerida (opcional):
        </label>
        <input
          type='number'
          id='suggestedRate'
          name='suggestedRate'
          value={formData.suggestedRate}
          onChange={handleInputChange}
          placeholder='Ingrese una tarifa en bs.'
          disabled={loading}
          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-900 placeholder-gray-500'
        />
      </div>

      <div className='flex justify-end space-x-3 pt-4'>
        <button
          type='button'
          onClick={onCancel}
          disabled={loading}
          className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={loading}
          className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default JobRequestForm;

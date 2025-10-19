'use client';
import MapJobRequest from '../mapJobRequest/MapJobRequest';

export default function JobLocationSection({
  formData,
  loading,
  initialLocation,
  currentMapLocation,
  isMapEnabled,
  onInputChange,
  onPositionChange,
}) {
  return (
    <>
      <fieldset className='job-selection-location'>
        <legend>Ubicación del trabajo:</legend>
        <label>
          <input
            type='radio'
            name='locationOption'
            value='keep'
            checked={formData.locationOption === 'keep'}
            onChange={onInputChange}
            disabled={loading}
          />
          Mantener ubicación guardada
        </label>
        <label>
          <input
            type='radio'
            name='locationOption'
            value='modify'
            checked={formData.locationOption === 'modify'}
            onChange={onInputChange}
            disabled={loading}
          />
          Modificar ubicación del trabajo
        </label>
      </fieldset>

      <div className='map-job-location'>
        <label>Mapa de ubicación:</label>
        {loading && !initialLocation ? (
          <p style={{ color: '#777', fontSize: '14px' }}>Cargando mapa...</p>
        ) : (
          <MapJobRequest
            isEnabled={isMapEnabled}
            initialLocationObject={currentMapLocation}
            onPositionChange={onPositionChange}
          />
        )}
      </div>
    </>
  );
}

'use client';
import JobLocationSection from '../jobLocationSection/JobLocationSection';

export default function JobRequestForm({
  formData,
  loading,
  error,
  isMapEnabled,
  currentMapLocation,
  initialLocation,
  onInputChange,
  onSubmit,
  onPositionChange,
  onClose,
}) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className='modal' onClick={handleOverlayClick}>
      <div className='modal-content'>
        <div className='task-header'>
          <h2>Formulario de solicitud</h2>
        </div>

        <div className='task-body'>
          <form onSubmit={onSubmit}>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <div className='job-motive-section'>
              <label htmlFor='jobMotive'>Motivo del trabajo:</label>
              <input
                type='text'
                id='jobMotive'
                name='jobMotive'
                value={formData.jobMotive}
                onChange={onInputChange}
                placeholder='Ingrese el motivo del trabajo...'
                required
                disabled={loading}
              />
            </div>

            <div className='job-description-section'>
              <label htmlFor='jobDescription'>Descripción:</label>
              <textarea
                id='jobDescription'
                name='jobDescription'
                value={formData.jobDescription}
                onChange={onInputChange}
                placeholder='Describa el trabajo a realizar...'
                required
                disabled={loading}
              />
            </div>

            <JobLocationSection
              formData={formData}
              loading={loading}
              initialLocation={initialLocation}
              currentMapLocation={currentMapLocation}
              isMapEnabled={isMapEnabled}
              onInputChange={onInputChange}
              onPositionChange={onPositionChange}
            />

            <div className='time-availability'>
              <label>Disponibilidad horaria:</label>
              <div className='time-inputs'>
                <label>
                  De:
                  <input
                    type='time'
                    name='startTime'
                    value={formData.startTime}
                    onChange={onInputChange}
                    required
                    disabled={loading}
                  />
                </label>
                <label>
                  Hasta:
                  <input
                    type='time'
                    name='endTime'
                    value={formData.endTime}
                    onChange={onInputChange}
                    required
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            <div className='suggested-rate'>
              <label htmlFor='suggestedRate'>Tarifa sugerida (opcional):</label>
              <input
                type='number'
                id='suggestedRate'
                name='suggestedRate'
                value={formData.suggestedRate}
                onChange={onInputChange}
                placeholder='Ingrese una tarifa en bs.'
                disabled={loading}
              />
            </div>

            <div className='modal-buttons'>
              <button
                type='button'
                className='cancel-request-btn'
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type='submit' className='save-request-btn' disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

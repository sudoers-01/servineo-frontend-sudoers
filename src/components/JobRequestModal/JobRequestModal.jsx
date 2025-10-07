import React, { useState, useEffect } from 'react';
import MapComponent from '../Map/MapComponent';
import './JobRequestModal.css';

const JobRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    jobMotive: '',
    jobDescription: '',
    locationOption: 'keep',
    startTime: '',
    endTime: '',
    suggestedRate: ''
  });

  const [mapEnabled, setMapEnabled] = useState(false);

  // Resetear form cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        jobMotive: '',
        jobDescription: '',
        locationOption: 'keep',
        startTime: '',
        endTime: '',
        suggestedRate: ''
      });
      setMapEnabled(false);
    }
  }, [isOpen]);

  // Controlar mapa según selección de ubicación
  useEffect(() => {
    setMapEnabled(formData.locationOption === 'modify');
  }, [formData.locationOption]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close" onClick={onClose}>&times;</button>
        
        <div className="task-header">
          <h2>Formulario de solicitud</h2>
        </div>

        <div className="task-body">
          <form onSubmit={handleSubmit}>
            {/* Motivo */}
            <div className="job-motive-section">
              <label htmlFor="jobMotive">Motivo del trabajo:</label>
              <input
                type="text"
                id="jobMotive"
                name="jobMotive"
                value={formData.jobMotive}
                onChange={handleInputChange}
                placeholder="Ingrese el motivo del trabajo..."
                required
              />
            </div>

            {/* Descripción */}
            <div className="job-description-section">
              <label htmlFor="jobDescription">Descripción:</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Describa el trabajo a realizar..."
                required
              />
            </div>

            {/* Selección de ubicación */}
            <fieldset className="job-selection-location">
              <legend>Ubicación del trabajo:</legend>
              <label>
                <input
                  type="radio"
                  name="locationOption"
                  value="keep"
                  checked={formData.locationOption === 'keep'}
                  onChange={handleInputChange}
                />
                Mantener ubicación guardada
              </label>
              <label>
                <input
                  type="radio"
                  name="locationOption"
                  value="modify"
                  checked={formData.locationOption === 'modify'}
                  onChange={handleInputChange}
                />
                Modificar ubicación del trabajo
              </label>
            </fieldset>

            {/* Mapa */}
            <div className="map-job-location">
              <label>Mapa de ubicación:</label>
              <MapComponent isEnabled={mapEnabled} />
            </div>

            {/* Disponibilidad horaria */}
            <div className="time-availability">
              <label>Disponibilidad horaria:</label>
              <div className="time-inputs">
                <label>
                  De: 
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Hasta: 
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Tarifa sugerida */}
            <div className="suggested-rate">
              <label htmlFor="suggestedRate">Tarifa sugerida (opcional):</label>
              <input
                type="number"
                id="suggestedRate"
                name="suggestedRate"
                value={formData.suggestedRate}
                onChange={handleInputChange}
                placeholder="Ingrese una tarifa"
              />
            </div>

            {/* Botones */}
            <div className="modal-buttons">
              <button 
                type="button" 
                className="cancel-request-btn" 
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="save-request-btn">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobRequestModal;
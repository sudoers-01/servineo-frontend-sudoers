import React, { useState, useEffect } from "react";
import MapJobRequest from "./MapJobRequest";
import "./JobRequestModal.css";

const API_URL = "http://localhost:3000";

const JobRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    jobMotive: "",
    jobDescription: "",
    locationOption: "keep",
    startTime: "",
    endTime: "",
    suggestedRate: "",
  });

  const [initialLocation, setInitialLocation] = useState(null);
  const [newLocation, setNewLocation] = useState(null);
  const [currentMapLocation, setCurrentMapLocation] = useState(null); // ✅ Nuevo estado para controlar la ubicación del mapa
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    if (isOpen) {
      const fetchUserLocation = async () => {
        setLoading(true);
        setError("");
        try {
          const token = getAuthToken();
          if (!token) throw new Error("No se encontró token de autenticación.");

          const res = await fetch(`${API_URL}/api/profile/location`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.msg || "Error al cargar la ubicación.");

          const userLocation = {
            lat: data.coordinates[1],
            lng: data.coordinates[0],
          };

          setInitialLocation(userLocation);
          setCurrentMapLocation(userLocation); // ✅ Inicializar la ubicación actual del mapa

        } catch (err) {
          console.error("Error al obtener ubicación:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserLocation();

      setFormData({
        jobMotive: "",
        jobDescription: "",
        locationOption: "keep",
        startTime: "",
        endTime: "",
        suggestedRate: "",
      });
      setNewLocation(null);
    }
  }, [isOpen]);

  // ✅ NUEVO EFFECT: Actualizar la ubicación del mapa cuando cambia la opción de ubicación
  useEffect(() => {
    if (formData.locationOption === "keep" && initialLocation) {
      // Cuando selecciona "mantener ubicación", resetear a la ubicación inicial
      setCurrentMapLocation(initialLocation);
      setNewLocation(null); // Limpiar cualquier ubicación modificada
    } else if (formData.locationOption === "modify" && newLocation) {
      // Cuando selecciona "modificar" y ya hay una ubicación modificada, usar esa
      setCurrentMapLocation(newLocation);
    } else if (formData.locationOption === "modify" && initialLocation) {
      // Cuando selecciona "modificar" por primera vez, empezar con la ubicación inicial
      setCurrentMapLocation(initialLocation);
    }
  }, [formData.locationOption, initialLocation, newLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No se encontró token de autenticación.");

      let finalLocation;
      if (formData.locationOption === "modify" && newLocation) {
        finalLocation = {
          type: "Point",
          coordinates: [newLocation.lng, newLocation.lat],
        };
      } else if (initialLocation) {
        finalLocation = {
          type: "Point",
          coordinates: [initialLocation.lng, initialLocation.lat],
        };
      } else {
        throw new Error("No se ha definido una ubicación para el trabajo.");
      }

      const payload = {
        jobMotive: formData.jobMotive,
        jobDescription: formData.jobDescription,
        location: finalLocation,
        startTime: formData.startTime,
        endTime: formData.endTime,
        suggestedRate: formData.suggestedRate || 0,
      };

      const res = await fetch(`${API_URL}/api/jobrequests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al guardar la solicitud.");

      onSubmit(data);
      onClose();

    } catch (err) {
      console.error("Error al enviar solicitud:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const isMapEnabled = formData.locationOption === "modify";

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="task-header">
          <h2>Formulario de solicitud</h2>
        </div>

        <div className="task-body">
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

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
                disabled={loading}
              />
            </div>

            <div className="job-description-section">
              <label htmlFor="jobDescription">Descripción:</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Describa el trabajo a realizar..."
                required
                disabled={loading}
              />
            </div>

            <fieldset className="job-selection-location">
              <legend>Ubicación del trabajo:</legend>
              <label>
                <input
                  type="radio"
                  name="locationOption"
                  value="keep"
                  checked={formData.locationOption === "keep"}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                Mantener ubicación guardada
              </label>
              <label>
                <input
                  type="radio"
                  name="locationOption"
                  value="modify"
                  checked={formData.locationOption === "modify"}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                Modificar ubicación del trabajo
              </label>
            </fieldset>

            <div className="map-job-location">
              <label>Mapa de ubicación:</label>
              {loading && !initialLocation ? (
                <p style={{ color: "#777", fontSize: "14px" }}>Cargando mapa...</p>
              ) : (
                <MapJobRequest
                  isEnabled={isMapEnabled}
                  // ✅ PASAMOS la ubicación actual que debe mostrar el mapa
                  initialLocationObject={currentMapLocation}
                  onPositionChange={(pos) => {
                    setNewLocation({ lat: pos.lat, lng: pos.lng });
                    setCurrentMapLocation({ lat: pos.lat, lng: pos.lng }); // ✅ Actualizar también la ubicación actual
                  }}
                />
              )}
            </div>

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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            <div className="suggested-rate">
              <label htmlFor="suggestedRate">Tarifa sugerida (opcional):</label>
              <input
                type="number"
                id="suggestedRate"
                name="suggestedRate"
                value={formData.suggestedRate}
                onChange={handleInputChange}
                placeholder="Ingrese una tarifa en bs."
                disabled={loading}
              />
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-request-btn"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="save-request-btn" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobRequestModal;
"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

//Ícono personalizado
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// Mueve el mapa cuando cambia la ubicación
function MoveMapToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14); // centramos automáticamente
    }
  }, [position, map]);
  return null;
}

export default function MapaLeaflet() {
  if (typeof window === "undefined") return null;

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [denied, setDenied] = useState(false);

  const defaultPos: [number, number] = [-17.3895, -66.1568]; // Cochabamba

  // permitir acceso a la ubicación
  const handleAllow = () => {
    setShowPrompt(false);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setDenied(true);
          setPosition(defaultPos);
        }
      );
    } else {
      setDenied(true);
      setPosition(defaultPos);
    }
  };

  //Denegar acceso
  const handleDeny = () => {
    setShowPrompt(false);
    setDenied(true);
    setPosition(defaultPos);
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={position || defaultPos}
        zoom={13}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {/* Centramos el mapa automáticamente */}
        {position && <MoveMapToPosition position={position} />}

        {position && (
          <Marker position={position} icon={customIcon}>
            <Popup>
              {denied
                ? "Ubicación por defecto (Cochabamba)"
                : "Tu ubicación actual"}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/*Ventana emergente de permiso */}
      {showPrompt && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "80vh",
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.6)", // Fondo más oscuro
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)", // Efecto difuminado
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.95)", // Blanco más sólido
              padding: "2rem",
              borderRadius: "1rem",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              width: "320px",
              color: "#222",
            }}
          >
            <h2
              style={{
                marginBottom: "1rem",
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#111",
              }}
            >
              Permitir ubicación
            </h2>

            <p
              style={{
                fontSize: "1rem",
                lineHeight: "1.4",
                color: "#333",
              }}
            >
              ¿Deseas permitir el acceso a tu ubicación actual?
            </p>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleAllow}
                style={{
                  padding: "0.7rem 1.4rem",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#43A047")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4CAF50")
                }
              >
                Permitir
              </button>

              <button
                onClick={handleDeny}
                style={{
                  padding: "0.7rem 1.4rem",
                  backgroundColor: "#F44336",
                  color: "white",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#D32F2F")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F44336")
                }
              >
                Denegar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

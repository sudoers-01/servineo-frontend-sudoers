"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Ícono personalizado
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

export default function MapaLeaflet() {
  if (typeof window === "undefined") return null;

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [denied, setDenied] = useState(false);

  const defaultPos: [number, number] = [-17.3895, -66.1568]; // Cochabamba

  // Solicitar ubicación si el usuario permite
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

  const handleDeny = () => {
    setShowPrompt(false);
    setDenied(true);
    setPosition(defaultPos);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 🧭 Mapa */}
      <MapContainer
        center={position || defaultPos}
        zoom={13}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
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

      {/* 🌟 Ventana emergente */}
      {showPrompt && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "80vh",
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "1rem",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              width: "320px",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>Permitir ubicación</h2>
            <p>¿Deseas permitir el acceso a tu ubicación actual?</p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={handleAllow}
                style={{
                  padding: "0.6rem 1.2rem",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Permitir
              </button>
              <button
                onClick={handleDeny}
                style={{
                  padding: "0.6rem 1.2rem",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
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

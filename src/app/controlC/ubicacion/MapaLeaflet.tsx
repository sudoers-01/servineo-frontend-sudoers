"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

function MoveMapToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
}

export default function MapaLeaflet() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [denied, setDenied] = useState(false);
  const defaultPos: [number, number] = [-17.3895, -66.1568]; // Cochabamba

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setDenied(true);
          setPosition(defaultPos);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setDenied(true);
      setPosition(defaultPos);
    }
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {}
      <div
        style={{
          background: "white",
          borderRadius: "1rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          padding: "1.5rem",
          maxWidth: "700px",
          margin: "2rem auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {}
        <h2
          style={{
            width: "100%",
            textAlign: "left",
            fontSize: "1.4rem",
            fontWeight: "600",
            borderBottom: "1px solid #ccc",
            marginBottom: "1rem",
            paddingBottom: "0.3rem",
            color: "#222",
          }}
        >
          Ubicación
        </h2>

        {}
        <div
          style={{
            width: "100%",
            height: "60vh",
            borderRadius: "0.8rem",
            overflow: "hidden",
            marginBottom: "1.5rem",
          }}
        >
          <MapContainer
            center={position || defaultPos}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />

            {position && <MoveMapToPosition position={position} />}

            {position && (
              <>
                <Marker position={position} icon={customIcon}>
                  <Popup>
                    {denied
                      ? "Ubicación por defecto (Cochabamba)"
                      : "Tu ubicación actual"}
                  </Popup>
                </Marker>

                <Circle
                  center={position}
                  radius={1000}
                  pathOptions={{ color: "blue", fillColor: "#cce5ff", fillOpacity: 0.3 }}
                />
              </>
            )}
          </MapContainer>
        </div>

        {}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "0.7rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#43A047")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#4CAF50")
            }
          >
            Finalizar registro
          </button>

          <button
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              padding: "0.7rem 1.5rem",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e0e0e0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0f0f0")
            }
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}



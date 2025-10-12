"use client";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

// Cargamos react-leaflet dinámicamente
const { MapContainer, TileLayer, Marker, Circle, Popup, useMap } = require("react-leaflet");
let L: any = null;

// Mueve el mapa al cambiar posición
function MoveMapToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
}

export default function MapaLeaflet() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [denied, setDenied] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  const defaultPos: [number, number] = [-17.3895, -66.1568]; // Cochabamba

  // Cargar Leaflet solo en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        L = leaflet;
        const icon = new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [35, 35],
          iconAnchor: [17, 35],
        });
        setCustomIcon(icon);
      });
    }
  }, []);

  // Permitir acceso a ubicación (mejor precisión)
  const handleAllow = () => {
    setShowPrompt(false);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("Error al obtener ubicación:", err);
          setDenied(true);
          setPosition(defaultPos);
        },
        {
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0, 
        }
      );
    } else {
      setDenied(true);
      setPosition(defaultPos);
    }
  };

  // Denegar acceso
  const handleDeny = () => {
    setShowPrompt(false);
    setDenied(true);
    setPosition(defaultPos);
  };

  return (
    <div className="relative w-full h-[80vh] rounded-2xl overflow-hidden shadow-lg">
      {customIcon && (
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
                pathOptions={{
                  color: "#3B82F6",
                  fillColor: "#3B82F6",
                  fillOpacity: 0.25,
                }}
              />
            </>
          )}
        </MapContainer>
      )}

      {/*Ventana emergente de permiso */}
      {showPrompt && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <div className="bg-white/95 p-6 rounded-2xl shadow-xl text-center max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Permitir ubicación
            </h2>
            <p className="text-gray-700 mb-6">
              ¿Deseas permitir el acceso a tu ubicación actual?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAllow}
                className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Permitir
              </button>
              <button
                onClick={handleDeny}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
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

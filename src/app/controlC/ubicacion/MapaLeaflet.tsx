"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { enviarUbicacion } from "../services/ubicacion";


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
  const [ubicacionPermitida, setUbicacionPermitida] = useState<boolean | null>(null);

  
  const ejecutado = useRef(false);

  useEffect(() => {
    if (ejecutado.current) return;
    ejecutado.current = true;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          
          setPosition([latitude, longitude]);
          setUbicacionPermitida(true);
          toast.success("📍 Ubicación detectada correctamente", { toastId: "ubicacion-exitosa" });
        },
        (error) => {
          console.warn("No se pudo obtener la ubicación:", error.message);
          toast.error("No se permitió el acceso a la ubicación.", { toastId: "ubicacion-denegada" });
          setUbicacionPermitida(false);
          setPosition(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.warn("El navegador no soporta geolocalización.");
      toast.error(" El navegador no soporta geolocalización.", { toastId: "ubicacion-no-soportada" });
      setUbicacionPermitida(false);
      setPosition(null);
    }
  }, []);

 
  const manejarEnvio = async () => {
    try {
      if (ubicacionPermitida && position) {
        await enviarUbicacion(position[0], position[1]);
        toast.success("Ubicación registrada correctamente.", { toastId: "envio-exitoso" });
      } else {
        await enviarUbicacion(0, 0);
        toast.warning("No se proporcionó ubicación. Se guardó como 'SIN UBICACIÓN'.", { toastId: "envio-sin-ubicacion" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar la ubicación al servidor.", { toastId: "error-envio" });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <ToastContainer position="bottom-right" autoClose={4000} />

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
            center={position || [-17.3895, -66.1568]}
            zoom={position ? 14 : 5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />

            {position && ubicacionPermitida && <MoveMapToPosition position={position} />}

            {position && ubicacionPermitida && (
              <>
                <Marker position={position} icon={customIcon}>
                  <Popup>Tu ubicación actual</Popup>
                </Marker>
                <Circle
                  center={position}
                  radius={1000}
                  pathOptions={{
                    color: "#2B6AE0",
                    fillColor: "#cce0ff",
                    fillOpacity: 0.3,
                  }}
                />
              </>
            )}
          </MapContainer>
        </div>

        <button
          style={{
            backgroundColor: "#2B6AE0",
            color: "white",
            padding: "0.8rem 1.8rem",
            border: "none",
            borderRadius: "0.6rem",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "0.2s",
            boxShadow: "0 3px 10px rgba(43,106,224,0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1AA7ED")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2B6AE0")}
          onClick={manejarEnvio}
        >
          Finalizar registro
        </button>
      </div>
    </div>
  );
}


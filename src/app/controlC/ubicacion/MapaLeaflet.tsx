"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapaLeaflet() {
  if (typeof window === "undefined") return null;

  const position: [number, number] = [-17.3895, -66.1568]; // Cochabamba, Bolivia

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      <Marker position={position}>
        <Popup>📍 Cochabamba, Bolivia</Popup>
      </Marker>
    </MapContainer>
  );
}
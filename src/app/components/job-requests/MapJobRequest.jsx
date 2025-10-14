import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapJobRequest.css';

// Configuración de iconos de Leaflet (ORIGINAL)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapJobRequest = ({ isEnabled, initialLocationObject, onPositionChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const initialPosition = useMemo(() => {
    if (!initialLocationObject) return [-16.5, -68.15];
    return [initialLocationObject.lat, initialLocationObject.lng];
  }, [initialLocationObject]);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(initialPosition, 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker(initialPosition, { draggable: false }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        onPositionChange({ lat, lng });
      });

      disableMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !initialPosition) return;

    markerRef.current.setLatLng(initialPosition);
    mapInstanceRef.current.setView(initialPosition, 15);
  }, [initialPosition]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (isEnabled) {
      enableMap();
    } else {
      disableMap();
    }
  }, [isEnabled]);

  const enableMap = () => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    marker.dragging.enable();
    mapRef.current.classList.remove('map-disabled');
  };

  const disableMap = () => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    marker.dragging.disable();
    mapRef.current.classList.add('map-disabled');
  };

  return <div ref={mapRef} className='map-container' />;
};

export default MapJobRequest;
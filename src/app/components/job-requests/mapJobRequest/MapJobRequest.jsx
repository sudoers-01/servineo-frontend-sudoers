'use client';
import React, { useEffect, useRef, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './MapJobRequest.css';

const MapJobRequest = ({ isEnabled, initialLocationObject, onPositionChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const initialPosition = useMemo(() => {
    if (!initialLocationObject) return [-16.5, -68.15];
    return [initialLocationObject.lat, initialLocationObject.lng];
  }, [initialLocationObject]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current).setView(initialPosition, 15);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker(initialPosition, { 
          draggable: true 
        }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', function() {
          const position = marker.getLatLng();
          onPositionChange({ 
            lat: position.lat, 
            lng: position.lng 
          });
        });

        if (isEnabled) {
          enableMap();
        } else {
          disableMap();
        }

        setMapReady(true);
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markerRef.current) return;

    const updatePosition = async () => {
      const L = await import('leaflet');
      markerRef.current.setLatLng(initialPosition);
      mapInstanceRef.current.setView(initialPosition, 15);
    };

    updatePosition();
  }, [initialPosition, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    if (isEnabled) {
      enableMap();
    } else {
      disableMap();
    }
  }, [isEnabled, mapReady]);

  const enableMap = async () => {
    const L = await import('leaflet');
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    
    if (map && marker) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      marker.dragging.enable();
      
      if (mapRef.current) {
        mapRef.current.style.pointerEvents = 'auto';
        mapRef.current.style.opacity = '1';
      }
    }
  };

  const disableMap = async () => {
    const L = await import('leaflet');
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    
    if (map && marker) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      marker.dragging.disable();
      
      if (mapRef.current) {
        mapRef.current.style.pointerEvents = 'none';
        mapRef.current.style.opacity = '0.6';
      }
    }
  };

  return (
    <div 
      ref={mapRef} 
      className="map-container"
    >
      {!mapReady && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666'
        }}>
          Cargando mapa...
        </div>
      )}
    </div>
  );
};

export default MapJobRequest;

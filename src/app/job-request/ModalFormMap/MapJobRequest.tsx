'use client';
import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { Location } from '../../../types/job-request';

interface MapJobRequestProps {
  isEnabled: boolean;
  initialLocationObject: Location | null;
  onPositionChange: (position: Location) => void;
}

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => void;
  dragging: { enable: () => void; disable: () => void };
  touchZoom: { enable: () => void; disable: () => void };
  doubleClickZoom: { enable: () => void; disable: () => void };
  scrollWheelZoom: { enable: () => void; disable: () => void };
  boxZoom: { enable: () => void; disable: () => void };
  keyboard: { enable: () => void; disable: () => void };
  remove: () => void;
}

interface LeafletMarker {
  setLatLng: (latlng: [number, number]) => void;
  getLatLng: () => { lat: number; lng: number };
  dragging: { enable: () => void; disable: () => void };
  on: (event: string, callback: () => void) => void;
}

const MapJobRequest: React.FC<MapJobRequestProps> = ({
  isEnabled,
  initialLocationObject,
  onPositionChange,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const initialPosition = useMemo<[number, number]>(() => {
    if (!initialLocationObject) return [-16.5, -68.15];
    return [initialLocationObject.lat, initialLocationObject.lng];
  }, [initialLocationObject]);

  const handlePositionChange = useCallback(
    (position: Location) => {
      onPositionChange(position);
    },
    [onPositionChange],
  );

  const enableMap = useCallback(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;

    if (map && marker) {
      try {
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
      } catch (error) {
        console.error('Error enabling map:', error);
      }
    }
  }, []);

  const disableMap = useCallback(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;

    if (map && marker) {
      try {
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
      } catch (error) {
        console.error('Error disabling map:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        if (!isMounted || !mapRef.current) return;

        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current).setView(initialPosition, 15);
        mapInstanceRef.current = map as unknown as LeafletMap;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker(initialPosition, {
          draggable: true,
        }).addTo(map);
        markerRef.current = marker as unknown as LeafletMarker;

        marker.on('dragend', function () {
          const position = marker.getLatLng();
          handlePositionChange({
            lat: position.lat,
            lng: position.lng,
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

    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      setMapReady(false);
    };
  }, [enableMap, disableMap, handlePositionChange, initialPosition, isEnabled]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markerRef.current) return;

    try {
      markerRef.current.setLatLng(initialPosition);
      mapInstanceRef.current.setView(initialPosition, 15);
    } catch (error) {
      console.error('Error updating map position:', error);
    }
  }, [initialPosition, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    if (isEnabled) {
      enableMap();
    } else {
      disableMap();
    }
  }, [isEnabled, mapReady, enableMap, disableMap]);

  return (
    <div ref={mapRef} className='h-64 w-full overflow-hidden rounded-md border border-gray-300'>
      {!mapReady && (
        <div className='flex h-full items-center justify-center text-gray-500'>
          Cargando mapa...
        </div>
      )}
    </div>
  );
};

export default MapJobRequest;

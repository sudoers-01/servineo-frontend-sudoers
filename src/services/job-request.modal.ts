import type { UserLocation, CreateJobRequestPayload, JobRequest } from '../types/job-request';
import { apiUrl } from '@/config/api';

export async function getUserLocation(token: string): Promise<UserLocation> {
  const userId = '68ec99ddf39c7c140f42fcfa';

  const res = await fetch(apiUrl(`api/profile/${userId}`), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || data.error || 'Error al cargar la ubicación.');
  }

  if (data?.location?.coordinates && Array.isArray(data.location.coordinates)) {
    return {
      lat: data.location.coordinates[1]?.toString() || '-16.5000',
      lng: data.location.coordinates[0]?.toString() || '-68.1500',
    };
  }

  console.warn('Usuario no tiene ubicación guardada, usando ubicación por defecto');
  return {
    lat: '-16.5000',
    lng: '-68.1500',
  };
}

export async function createJobRequest(
  payload: CreateJobRequestPayload,
  token: string,
): Promise<JobRequest> {
  const res = await fetch(apiUrl('api/jobrequests'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al guardar la solicitud.');

  return data as JobRequest;
}

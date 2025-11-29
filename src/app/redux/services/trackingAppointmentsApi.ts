import { baseApi } from './baseApi';

// 1. Interfaces (Tipos de datos)
export interface MapLocation {
  _id: string;
  lat: string;
  lon: string;
  schedule_state: 'booked' | 'cancelled';
  fixerName: string; 
  current_requester_name: string;
  starting_time: string;
}

export interface TrackingMetrics {
  total: number;
  active: number;
  cancelled: number;
}

export interface FixerStat {
  id: string;
  name: string;
  total: number;
  active: number;
  cancelled: number;
  rescheduled: number;
  rate: string;
}

interface FilterArgs {
  startDate?: string;
  endDate?: string;
}

// 2. Definición de la API (Un solo bloque injectEndpoints)
export const trackingAppointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // Endpoint A: Mapa
    getMapLocations: builder.query<MapLocation[], void>({
      query: () => ({
        url: '/admin/map-locations',
        method: 'GET',
      }),
      providesTags: ['Statistics'],
    }),

    // Endpoint B: Métricas Globales
    getTrackingMetrics: builder.query<TrackingMetrics, FilterArgs>({
      query: ({ startDate, endDate }) => {
        let url = '/admin/metrics';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const queryString = params.toString();
        return {
          url: queryString ? `${url}?${queryString}` : url,
          method: 'GET',
        };
      },
      providesTags: ['Statistics'],
    }),

    // Endpoint C: Tabla de Rendimiento por Fixer (El nuevo)
    getFixerStats: builder.query<FixerStat[], void>({
      query: () => ({
        url: '/admin/fixer-stats',
        method: 'GET',
      }),
      providesTags: ['Statistics'],
    }),

  }),
});

// 3. Exportamos TODOS los Hooks juntos
export const { 
  useGetMapLocationsQuery, 
  useGetTrackingMetricsQuery,
  useGetFixerStatsQuery 
} = trackingAppointmentsApi;
import { baseApi } from './baseApi';

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

interface FilterArgs {
  startDate?: string;
  endDate?: string;
}

// 2. Definición de la API
export const trackingAppointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    
    getMapLocations: builder.query<MapLocation[], void>({
      query: () => ({
        url: '/admin/map-locations',
        method: 'GET',
      }),
      providesTags: ['Statistics'], 
    }),

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
  }),
});

export const { useGetMapLocationsQuery, useGetTrackingMetricsQuery } = trackingAppointmentsApi;
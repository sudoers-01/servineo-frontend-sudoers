// utils.ts
export type RatedOfferJob = {
  id: string;
  title: string;
  city: string;
  dateISO: string;
  isActive: boolean;
  categories: string[];
  photosCount: number;
  image?: string; // <-- agregado como opcional
};

export const fallbackImage = 'https://via.placeholder.com/300x180?text=Oferta+de+Trabajo';

export const mockOfferJobs: RatedOfferJob[] = [
  {
    id: 'off_001',
    title: 'Reparación y mantenimiento de electrodomésticos',
    city: 'Santa Cruz',
    dateISO: '2025-10-18T12:00:00.000Z',
    isActive: true,
    categories: ['Reparación de electrodomésticos'],
    photosCount: 1,
    image: 'https://via.placeholder.com/300x180?text=Electrodomésticos',
  },
  {
    id: 'off_002',
    title: 'Instalación de equipo eléctrico',
    city: 'La Paz',
    dateISO: '2025-10-18T08:00:00.000Z',
    isActive: false,
    categories: ['Electricidad'],
    photosCount: 3,
    image: 'https://via.placeholder.com/300x180?text=Electricidad',
  },
  {
    id: 'off_003',
    title: 'Servicio equipo eléctrico',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: true,
    categories: ['Electricidad'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
  {
    id: 'off_004',
    title: 'Servicio de electricidad',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: false,
    categories: ['Electricidad'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
  {
    id: 'off_005',
    title: 'Servicio de pintura',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: false,
    categories: ['Pintura'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
  {
    id: 'off_006',
    title: 'Servicio de carpinteria',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: true,
    categories: ['Carpinteria'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
  {
    id: 'off_007',
    title: 'Servicio de chaperia',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: false,
    categories: ['Chaperia'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
  {
    id: 'off_008',
    title: 'Servicio de plomería',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: false,
    categories: ['Plomería'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
  {
    id: 'off_009',
    title: 'Servicio de carpinteria',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: true,
    categories: ['Carpinteria'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
  {
    id: 'off_010',
    title: 'Servicio de plomería',
    city: 'Cochabamba',
    dateISO: '2025-10-18T17:00:00.000Z',
    isActive: true,
    categories: ['Plomería'],
    photosCount: 2,
    image: 'https://via.placeholder.com/300x180?text=Plomería',
  },
];

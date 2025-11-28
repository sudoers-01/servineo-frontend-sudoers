export type RatedOfferJob = {
  id: string;
  title: string;
  city: string;
  dateISO: string;
  isActive: boolean;
  categories: string[];
  photosCount: number;
};

export const mockOfferJobs: RatedOfferJob[] = [
  {
    id: "off_001",
    title: "Reparación y mantenimiento de electrodomésticos",
    city: "Santa Cruz",
    dateISO: "2025-10-18T12:00:00.000Z",
    isActive: true,
    categories: ["Reparación de electrodomésticos"],
    photosCount: 1,
  },
  {
    id: "off_002",
    title: "Reparación de grifos",
    city: "Cochabamba",
    dateISO: "2025-10-18T09:30:00.000Z",
    isActive: false,
    categories: ["Plomería"],
    photosCount: 0,
  },
];

export const offerJobStateOptions = [
  { key: "active", label: "Activas" },
  { key: "inactive", label: "Inactivas" },
];

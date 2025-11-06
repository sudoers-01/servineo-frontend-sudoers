export type RatedJob = {
  id: string;
  title: string;
  dateISO: string;      // ISO 8601
  rating: 0 | 1 | 2 | 3;
};

export const mockRatedJobs: RatedJob[] = [
  { id:'j1', title:'Reparación de toma eléctrica', dateISO:'2025-10-10T08:30:00Z', rating: 2 },
  { id:'j2', title:'Reparación de toma eléctrica', dateISO:'2025-10-10T09:10:00Z', rating: 2 },
  { id:'j3', title:'Reparación de toma eléctrica', dateISO:'2025-10-10T10:05:00Z', rating: 0 },
  { id:'j4', title:'Reparación de toma eléctrica', dateISO:'2025-10-10T11:40:00Z', rating: 0 },
  { id:'j5', title:'Reparación de toma eléctrica', dateISO:'2025-10-09T15:00:00Z', rating: 3 },
  { id:'j6', title:'Reparación de toma eléctrica', dateISO:'2025-10-08T12:00:00Z', rating: 1 },
  { id:'j7', title:'Reparación de toma eléctrica', dateISO:'2025-10-08T12:00:00Z', rating: 1 },
  { id:'j8', title:'Reparación de toma eléctrica', dateISO:'2025-10-08T12:00:00Z', rating: 1 },
  { id:'j9', title:'Reparación de toma eléctrica', dateISO:'2025-10-08T12:00:00Z', rating: 1 },
];

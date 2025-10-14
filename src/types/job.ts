export interface Job {
  _id: string;
  title: string;
  description: string;
  status: string;
  requesterId: string;
  fixerId: string;
  price: number;
  createdAt: string;
  rating?: number;
  comment?: string;
}
